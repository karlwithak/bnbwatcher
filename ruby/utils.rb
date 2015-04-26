require 'json'
require 'net/http'
require 'pg'
require 'yaml'

module Utils

  def self.json_for_uri(uri)
    uri = URI.parse(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Get.new(uri.request_uri)

    response = http.request(request)
    JSON.parse(response.body)
  end

  def self.get_db_connection
    server_info = YAML.load_file '../server_info.yml'
    db_info = server_info['db_info']
    PG.connect(
        :dbname => db_info['name'],
        :user => db_info['user'],
        :password => db_info['pass'],
        :port => db_info['port'],
        :host => db_info['host'])
  end

  def self.id_array_to_string(id_array)
    ids_string = id_array.to_s
    ids_string = ids_string.gsub('[', '{')
    ids_string.gsub(']', '}')
  end

  def self.string_to_id_array(string)
    string = string.gsub(/[{}]/, '')
    id_array = string.split(',')
    id_array.collect { |x| x.to_i }
  end
end
