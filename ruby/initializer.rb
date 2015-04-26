require '../ruby/fetcher'

def main
  conn = Utils.get_db_connection
  conn.exec('SELECT * FROM watchers WHERE room_ids IS NULL') do |result|
    result.each do |watcher|
      ids = Fetcher.fetch_ids_for_watcher(watcher)
      conn.exec_params('UPDATE watchers SET room_ids = $1 WHERE id = $2',
                       [Utils.id_array_to_string(ids), watcher['id']])
    end
  end
end

if __FILE__ == $PROGRAM_NAME
  main
end
