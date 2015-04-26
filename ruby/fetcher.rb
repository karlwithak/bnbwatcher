require 'pg'
require './utils'

class Fetcher
  BASE_URL = 'https://m.airbnb.ca/api/-/v1/listings/search?&items_per_page=50&currency=USD'

  def self.clean_up_row(col_name, col_val)
    return nil if
        col_val.nil? or
        col_name.eql?('email') or
        col_name.eql?('id') or
        col_val.eql?('f')

    if col_name.eql?('min_bathrooms')
      col_val = col_val.to_f / 10
    end

    if col_name.eql?('room_type_entire')
      col_name = 'room_types[]'
      col_val = 'Entire+room'
    end

    if col_name.eql?('room_type_private')
      col_name = 'room_types[]'
      col_val = 'Private+room'
    end

    if col_name.eql?('room_type_shared')
      col_name = 'room_types[]'
      col_val = 'Shared+room'
    end

    if col_name.eql?('location')
      col_val = col_val.gsub(' ', '+')
    end

    return col_name, col_val
  end

  def self.build_query(row)
    query = BASE_URL
    row.each do |col_name, col_val|
      col_name, col_val = clean_up_row(col_name, col_val)
      query += "&#{col_name}=#{col_val}" unless col_name.nil?
    end
    query
  end

  def self.fetch_ids_for_watcher(watcher)
    uri = build_query(watcher)
    json = Utils.json_for_uri(uri)
    room_ids = json['listings'].collect { |listing| listing['listing']['id'] }
    total_listings = json['listings_count'].to_i
    returned_listings = json['listings'].length
    while returned_listings < total_listings
      json = Utils.json_for_uri(uri + '&offset=' + returned_listings.to_s)
      new_room_ids = json['listings'].collect { |listing| listing['listing']['id'] }
      room_ids.concat(new_room_ids)
      returned_listings += json['listings'].length
    end
    return room_ids
  end

  private_class_method :clean_up_row, :build_query
end

