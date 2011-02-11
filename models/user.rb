class User < Ohm::Model
  attribute :uid
  index :uid

  attribute :nickname
  attribute :image

  attribute :lat
  attribute :long

  attribute :created
  attribute :modified

  counter :score
end
