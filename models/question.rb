# coding: utf-8
class Question
  Questions = [
    {:name => '上野駅',
     :sw => [35.71195412156686, 139.77458887140912], :ne => [35.7154734513227, 139.7793953899638]},
    {:name => '東京駅',
     :sw => [35.67968054799929, 139.76463251154584], :ne => [35.682852719749775, 139.7697394375102]},
    {:name => '品川駅',
     :sw => [35.62699012510529, 139.73776750605268], :ne => [35.63023415289879, 139.74034242670697]}
  ]
  
  def self.random_get_index
    (0..Questions.length-1).to_a.sample
  end
  
  def self.random_get
    Questions.sample
  end
end
