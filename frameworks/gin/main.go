// ADSMedia Gin (Go) Integration
// Send emails via ADSMedia API from Gin applications
//
// go get github.com/gin-gonic/gin

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

const APIBaseURL = "https://api.adsmedia.live/v1"

// ADSMediaClient is the API client
type ADSMediaClient struct {
	APIKey        string
	DefaultFromName string
}

// SendEmailRequest represents send email parameters
type SendEmailRequest struct {
	To       string `json:"to"`
	ToName   string `json:"to_name,omitempty"`
	Subject  string `json:"subject"`
	HTML     string `json:"html"`
	Text     string `json:"text,omitempty"`
	FromName string `json:"from_name,omitempty"`
	ReplyTo  string `json:"reply_to,omitempty"`
}

// BatchRecipient represents a batch recipient
type BatchRecipient struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

// BatchEmailRequest represents batch email parameters
type BatchEmailRequest struct {
	Recipients []BatchRecipient `json:"recipients"`
	Subject    string           `json:"subject"`
	HTML       string           `json:"html"`
	Text       string           `json:"text,omitempty"`
	Preheader  string           `json:"preheader,omitempty"`
	FromName   string           `json:"from_name,omitempty"`
}

// APIResponse represents the API response
type APIResponse struct {
	Success bool                   `json:"success"`
	Data    map[string]interface{} `json:"data,omitempty"`
	Error   *APIError              `json:"error,omitempty"`
}

// APIError represents an API error
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// NewADSMediaClient creates a new client
func NewADSMediaClient(apiKey string) *ADSMediaClient {
	if apiKey == "" {
		apiKey = os.Getenv("ADSMEDIA_API_KEY")
	}
	return &ADSMediaClient{
		APIKey:        apiKey,
		DefaultFromName: "Gin",
	}
}

func (c *ADSMediaClient) request(method, endpoint string, body interface{}) (*APIResponse, error) {
	url := APIBaseURL + endpoint

	var reqBody io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(data)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result APIResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if !result.Success && result.Error != nil {
		return nil, fmt.Errorf("%s: %s", result.Error.Code, result.Error.Message)
	}

	return &result, nil
}

// Send sends a single email
func (c *ADSMediaClient) Send(req SendEmailRequest) (*APIResponse, error) {
	if req.FromName == "" {
		req.FromName = c.DefaultFromName
	}
	return c.request("POST", "/send", req)
}

// SendBatch sends batch emails
func (c *ADSMediaClient) SendBatch(req BatchEmailRequest) (*APIResponse, error) {
	if req.FromName == "" {
		req.FromName = c.DefaultFromName
	}
	return c.request("POST", "/send/batch", req)
}

// CheckSuppression checks if an email is suppressed
func (c *ADSMediaClient) CheckSuppression(email string) (*APIResponse, error) {
	return c.request("GET", "/suppressions/check?email="+email, nil)
}

// Ping tests API connectivity
func (c *ADSMediaClient) Ping() (*APIResponse, error) {
	return c.request("GET", "/ping", nil)
}

// ADSMediaMiddleware creates a Gin middleware
func ADSMediaMiddleware(apiKey string) gin.HandlerFunc {
	client := NewADSMediaClient(apiKey)
	
	return func(c *gin.Context) {
		c.Set("adsmedia", client)
		c.Next()
	}
}

// GetADSMedia gets the client from context
func GetADSMedia(c *gin.Context) *ADSMediaClient {
	client, _ := c.Get("adsmedia")
	return client.(*ADSMediaClient)
}

// RegisterEmailRoutes registers email routes
func RegisterEmailRoutes(r *gin.RouterGroup) {
	r.POST("/send", func(c *gin.Context) {
		var req SendEmailRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		client := GetADSMedia(c)
		result, err := client.Send(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"success": true, "data": result.Data})
	})

	r.POST("/batch", func(c *gin.Context) {
		var req BatchEmailRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		client := GetADSMedia(c)
		result, err := client.SendBatch(req)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"success": true, "data": result.Data})
	})

	r.GET("/check", func(c *gin.Context) {
		email := c.Query("email")
		
		client := GetADSMedia(c)
		result, err := client.CheckSuppression(email)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"success": true, "data": result.Data})
	})

	r.GET("/ping", func(c *gin.Context) {
		client := GetADSMedia(c)
		result, err := client.Ping()
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"success": true, "data": result.Data})
	})
}

func main() {
	r := gin.Default()

	// Add middleware
	r.Use(ADSMediaMiddleware(os.Getenv("ADSMEDIA_API_KEY")))

	// Register routes
	email := r.Group("/email")
	RegisterEmailRoutes(email)

	r.Run(":8080")
}

