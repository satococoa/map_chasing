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

  def to_hash
    hash = {}
    attributes.each do |attr|
      hash[attr] = self.send(attr)
    end
    hash
  end
end
