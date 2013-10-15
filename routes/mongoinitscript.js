
use zomatodb
db.restaurants.ensureIndex({location: "2dsphere"})

db.restaurants.insert({_id:1,name:"little italy jubilee hills",location: [78.41266,17.42593], rating: 4})

db.restaurants.insert({_id:2,name:"little italy madhapur",location: [78.39107,17.44115], rating: 3})

db.restaurants.insert({_id:3,name:"Prego Food of Italy",location: [78.38067,17.44118], rating: 3})

db.restaurants.insert({_id:5,name:"Wonton chinese",location: [78.34167,17.43594], rating: 3.5})

db.restaurants.insert({_id:6,name:"Mainland China",location: [78.39107,17.44115], rating: 3.5})

