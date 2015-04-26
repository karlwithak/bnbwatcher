require 'mail'

module Emailer

  def self.send_alert(new_ids, watcher)
    body = "Here are your new rooms: \n"
    new_ids.each { |id| body <<
        "https://www.airbnb.com/rooms/#{id}?checkin=#{watcher['checkin']}&checkout=#{watcher['checkout']} \n"}
    mail = Mail.new do
      from    'nkhrynui@uwaterloo.ca'
      to      watcher['email']
      subject "#{new_ids.length} new rooms in #{watcher['location']}"
      body    body
    end

    mail.delivery_method :sendmail
    mail.deliver
  end
end
