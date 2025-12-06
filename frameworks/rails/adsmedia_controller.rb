# ADSMedia Controller for Rails
# Add routes in config/routes.rb:
# namespace :api do
#   resources :emails, only: [] do
#     collection do
#       post :send_email
#       post :send_batch
#       get :check_suppression
#       get :ping
#     end
#   end
# end

class Api::EmailsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def send_email
    result = adsmedia.send_email(
      to: params[:to],
      subject: params[:subject],
      html: params[:html],
      to_name: params[:to_name],
      from_name: params[:from_name],
      text: params[:text]
    )
    render json: { success: true, data: result }
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  def send_batch
    result = adsmedia.send_batch(
      recipients: params[:recipients],
      subject: params[:subject],
      html: params[:html],
      text: params[:text],
      preheader: params[:preheader],
      from_name: params[:from_name]
    )
    render json: { success: true, data: result }
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  def check_suppression
    result = adsmedia.check_suppression(params[:email])
    render json: { success: true, data: result }
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  def ping
    result = adsmedia.ping
    render json: { success: true, data: result }
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end

  private

  def adsmedia
    @adsmedia ||= ADSMedia.client
  end
end

