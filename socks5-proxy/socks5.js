var socks = require('socksv5');

var srv = socks.createServer(function(info, accept, deny) {
  accept();
});
srv.listen(4559, '10.128.0.2', function() {
  console.log('SOCKS server listening on port 4559');
});

srv.useAuth(socks.auth.UserPassword(function(user, password, cb) {
  cb(user === 'implosive' && password === 'GwWKFHuHFR6BMCSJ');
}));
