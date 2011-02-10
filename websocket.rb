require 'em-websocket'
require 'logger'

EventMachine.run {
  @logger = Logger.new(STDERR)
  @channel = EM::Channel.new
  
  EventMachine::WebSocket.start(:host => '0.0.0.0', :port => 8080) do |ws|
    ws.onopen {
      sid = @channel.subscribe{|msg| ws.send msg}
      @logger.debug "#{sid} connected!"
      
      ws.onmessage {|msg|
        @logger.debug "<#{sid}>: #{msg}"
        @channel.push msg
      }
      ws.onclose {
        @channel.unsubscribe(sid)
        @logger.debug "#{sid} disconnected!"
      }
    }
  end
}
