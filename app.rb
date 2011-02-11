configure :production do
  enable :sessions
  use OmniAuth::Builder do
    provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET']
  end
  uri = URI.parse(ENV['REDISTOGO_URL'])
  Ohm.connect(:host => uri.host, :port => uri.port, :password => uri.password)
end

configure :development do
  enable :sessions
  config = YAML::load_file('config.yml')
  use OmniAuth::Builder do
    provider :twitter, config['twitter']['key'], config['twitter']['secret']
  end
  Ohm.connect
  Pusher.app_id = config['pusher']['app_id']
  Pusher.key = config['pusher']['key']
  Pusher.secret = config['pusher']['secret']
end

helpers do
  def login_required
    redirect '/auth/twitter' unless login?
  end
  def login?
    !session[:uid].nil?
  end
end

get '/' do
  login_required
  haml :index
end

post '/push' do
  # for debug only
  Pusher['test_channel'].trigger('my_event', {:msg => params[:msg]}, params[:socket_id])
end

get '/auth/twitter/callback' do
  auth_hash = request.env['omniauth.auth']
  session[:uid] = auth_hash['uid']
  session[:nickname] = auth_hash['user_info']['nickname']
  session[:image] = auth_hash['user_info']['image']
  redirect '/'
end
