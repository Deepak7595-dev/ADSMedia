# ADSMedia Ruby on Rails Integration
# Send emails via ADSMedia API from Rails applications
#
# gem 'httparty'

require 'httparty'
require 'json'

module ADSMedia
  API_BASE_URL = 'https://api.adsmedia.live/v1'.freeze

  class Client
    include HTTParty
    base_uri API_BASE_URL

    def initialize(api_key = nil, default_from_name: 'Rails')
      @api_key = api_key || ENV['ADSMEDIA_API_KEY'] || Rails.application.credentials.dig(:adsmedia, :api_key)
      @default_from_name = default_from_name

      raise ArgumentError, 'ADSMedia API key not configured' unless @api_key
    end

    # Send a single email
    def send_email(to:, subject:, html:, to_name: nil, from_name: nil, text: nil, reply_to: nil)
      payload = {
        to: to,
        subject: subject,
        html: html,
        from_name: from_name || @default_from_name
      }
      payload[:to_name] = to_name if to_name
      payload[:text] = text if text
      payload[:reply_to] = reply_to if reply_to

      request(:post, '/send', payload)
    end

    # Send batch emails
    def send_batch(recipients:, subject:, html:, text: nil, preheader: nil, from_name: nil)
      payload = {
        recipients: recipients,
        subject: subject,
        html: html,
        from_name: from_name || @default_from_name
      }
      payload[:text] = text if text
      payload[:preheader] = preheader if preheader

      request(:post, '/send/batch', payload)
    end

    # Check if email is suppressed
    def check_suppression(email)
      request(:get, '/suppressions/check', email: email)
    end

    # Test API connection
    def ping
      request(:get, '/ping')
    end

    # Get usage statistics
    def usage
      request(:get, '/account/usage')
    end

    private

    def request(method, endpoint, body = nil)
      options = {
        headers: {
          'Authorization' => "Bearer #{@api_key}",
          'Content-Type' => 'application/json',
          'Accept' => 'application/json'
        }
      }

      if method == :get && body
        options[:query] = body
      elsif body
        options[:body] = body.to_json
      end

      response = self.class.send(method, endpoint, options)
      result = JSON.parse(response.body, symbolize_names: true)

      unless result[:success]
        raise StandardError, result.dig(:error, :message) || 'ADSMedia API Error'
      end

      result[:data]
    end
  end

  # Rails configuration
  class << self
    attr_accessor :configuration

    def configure
      self.configuration ||= Configuration.new
      yield(configuration)
    end

    def client
      @client ||= Client.new(configuration&.api_key, default_from_name: configuration&.from_name || 'Rails')
    end
  end

  class Configuration
    attr_accessor :api_key, :from_name

    def initialize
      @api_key = ENV['ADSMEDIA_API_KEY']
      @from_name = 'Rails'
    end
  end
end

