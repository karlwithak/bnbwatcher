require '../ruby/fetcher'

def main
  conn = Utils.get_db_connection
  conn.exec('SELECT * FROM watchers WHERE room_ids IS NULL') do |result|
    result.each do |watcher|
      ids = Fetcher.fetch_ids_for_watcher(watcher)
      ids_string = ids.to_s
      ids_string = ids_string.gsub('[', '{')
      ids_string = ids_string.gsub(']', '}')
      conn.exec_params('UPDATE watchers SET room_ids = $1 WHERE id = $2',
        [ids_string, watcher['id']])
    end
  end
end

if __FILE__ == $PROGRAM_NAME
  main
end
