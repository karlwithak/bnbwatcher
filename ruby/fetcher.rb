require 'pg'

conn = PG.connect(
    :dbname => 'airbnbwatch_dev',
    :user => 'airbnbwatch_user',
    :password => 'airbnbwatch_pass',
    :port => 5432,
    :host => 'localhost')

conn.exec('SELECT * FROM watchers') do |result|
  result.each do |row|
    puts "email: #{row['email']}, city: #{row['city']}"
  end
end
