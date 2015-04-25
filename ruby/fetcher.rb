require 'pg'

conn = PG.connect(
    :dbname => 'airbnbwatch_dev',
    :user => 'airbnbwatch_user',
    :password => 'airbnbwatch_pass',
    :port => 5432,
    :host => 'localhost')

def handle_row(row)
  query = ''
  row.each do |colName, colVal|
    unless colVal.nil?
      query += "?#{colName}=#{colVal}"
    end
  end
  print query + "\n"
end

conn.exec('SELECT * FROM watchers') do |result|
  result.each do |row|
    handle_row row
  end
end


