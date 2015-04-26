require 'json'
require 'net/http'
require 'pg'

module Utils

  def self::json_for_uri(uri)
    uri = URI.parse(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Get.new(uri.request_uri)

    response = http.request(request)
    JSON.parse(response.body)
  end

  def self::get_db_connection
    PG.connect(
        :dbname => 'airbnbwatch_dev',
        :user => 'airbnbwatch_user',
        :password => 'airbnbwatch_pass',
        :port => 5432,
        :host => 'localhost')
  end
end
