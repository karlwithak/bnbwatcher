require 'pg'

BASE_URL = 'https://m.airbnb.ca/api/-/v1/listings/search?'
#?location=los+angeles&number_of_guests=1&offset=0&checkin=2015-04-26&checkout=2015-05-01&room_types%5B%5D=Private+room&room_types%5B%5D=Shared+room&min_beds=5&min_bedrooms=3&min_bathrooms=4&guests=1&items_per_page=20'


conn = PG.connect(
    :dbname => 'airbnbwatch_dev',
    :user => 'airbnbwatch_user',
    :password => 'airbnbwatch_pass',
    :port => 5432,
    :host => 'localhost')

def clean_up_row(col_name, col_val)
  if col_val.nil? or col_name.eql?('email')
    return nil
  end

  if col_val.eql?('f')
    return nil
  end

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

def build_query(row)
  query = BASE_URL
  row.each do |col_name, col_val|
    col_name, col_val = clean_up_row(col_name, col_val)
    unless col_name.nil?
      query += "&#{col_name}=#{col_val}"
    end
  end
  query = query.sub('&', '')
  print query + "\n"
end

conn.exec('SELECT * FROM watchers') do |result|
  result.each do |row|
    build_query row
  end
end


