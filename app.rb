require './models/user'
require './models/question'

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
  def login(auth_hash)
    users = User.find(:uid => auth_hash['uid'])
    if users.empty?
      user = User.create(
        :uid      => auth_hash['uid'],
        :nickname => auth_hash['user_info']['nickname'],
        :image    => auth_hash['user_info']['image'],
        :created  => Time.now.to_s,
        :modified => Time.now.to_s
      )
    else
      user = users.first
    end
    load_to_session(user)
    Pusher['map-chasing_1'].trigger('login', {:msg => params[:msg]}, params[:socket_id])
  end
  def load_to_session(user)
    user.attributes.each do |at|
      session[at] = user.send(at)
    end
  end
  def logout
    session.clear
    Pusher['map-chasing_1'].trigger('logout', {:msg => params[:msg]}, params[:socket_id])
  end
  def current_user
    return nil unless login?
    User.find(:uid => session[:uid]).first
  end
end

get '/' do
  login_required
  user = current_user
  cur = Ohm.redis.get('current_question')
  if cur.nil?
    q = Question::random_get
  else
    q = Question::Questions[cur.to_i]
  end
  haml :index, :locals => {:user => user.to_hash.to_json, :q => q.to_json}
end

get '/logout' do
  if login?
    user = current_user
    Pusher['map-chasing'].trigger('disappear', {:uid => user.uid})
    logout
  end
  haml :logout, :layout => :plain
end

post '/users' do
  user = current_user
  user.update_attributes :lat => params[:lat], :long => params[:lng], :modified => Time.now.to_s
  user.save

  Pusher['map-chasing'].trigger('appear', user.to_hash, params[:socket_id])
end

put '/user/:uid' do |uid|
  user = current_user
  user.update_attributes :lat => params[:lat], :long => params[:lng], :modified => Time.now.to_s
  user.save

  Pusher['map-chasing'].trigger('move', user.to_hash, params[:socket_id])
end

put '/user/:uid/score' do |uid|
  user = current_user
  user.update_attributes :modified => Time.now.to_s
  user.save
  user.incr :score

  while
    old = Ohm.redis.get('current_question')
    cur = Question::random_get_index
    break if old.nil? || old.to_i != cur
  end
  Ohm.redis.set('current_question', cur)

  Pusher['map-chasing'].trigger('score', user.to_hash, params[:socket_id])
  Pusher['map-chasing'].trigger('question', Question::Questions[cur])
end

get '/auth/twitter/callback' do
  auth_hash = request.env['omniauth.auth']
  login(auth_hash)
  redirect '/'
end
