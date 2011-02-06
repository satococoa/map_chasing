(function($){
  $(function(){
    var host = location.hostname;
    var url = 'ws://'+host+':8080/';
    var ws = new WebSocket(url);
    var $ws = $(ws);

    var dispMessage = function(msg) {
      var $elem = $('<li/>').text(msg);
      $elem.prependTo($('#log'));
    };

    $ws.bind('open', function(){
      $('#send-button').click(function(){
        var message = $('#message').val();
        if (message == '') return;
        ws.send(message);
        $('#message').val('');
      });
      dispMessage('connected');
    });

    $ws.bind('close', function(){
      $('#send-button').unbind('click');
      dispMessage('disconnected');
    });

    $ws.bind('message', function(event){
      var msg = event.originalEvent.data;
      if (msg == '') return;
      dispMessage("> "+msg);
    });

    $(window).unload(function(){
      ws.close();
    });

    $(window).bind('devicemotion', function(event){
      var threshold = 10;
      var acc = event.originalEvent.accelerationIncludingGravity;
      if (Math.abs(acc.x) > threshold) {
        if (acc.x > 0) {
          ws.send('右');
        } else {
          ws.send('左');
        }
      }
      if (Math.abs(acc.y) > threshold) {
        if (acc.y > 0) {
          ws.send('上');
        } else {
          ws.send('下');
        }
      }
      if (Math.abs(acc.z) > threshold) {
        if (acc.z > 0) {
          ws.send('手前');
        } else {
          ws.send('奥');
        }
      }
    });
  });

})(jQuery);
