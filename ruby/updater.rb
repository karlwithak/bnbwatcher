require '../ruby/fetcher'

def main
  conn = Utils.get_db_connection
  conn.exec('SELECT * FROM watchers WHERE room_ids IS NOT NULL') do |result|
    result.each do |watcher|
      old_ids = watcher['room_ids']
      old_ids = Utils.string_to_id_array(old_ids)
      current_ids = Fetcher.fetch_ids_for_watcher(watcher)
      new_ids = current_ids - old_ids
      p new_ids
      conn.exec_params('UPDATE watchers SET room_ids = $1 WHERE id = $2',
                       [Utils.id_array_to_string(current_ids), watcher['id']])
    end
  end
end

if __FILE__ == $PROGRAM_NAME
  main
end
