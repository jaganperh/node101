var results2 = [
  "{\"name\":\"Jimbo\",\"college\":\"IIT-M\",\"GPA\":5}",
  "{\"name\":\"Anand\",\"college\":\"Anna University\"}"
]

var results = []

results = {"name":"Jimbo","college":"IIT-M","GPA":5},{"name":"Anand","college":"Anna University"}

console.log(results)

for(var i = 0; i < results.length; i++)
{
    results[i] = JSON.parse(results[i])

}

console.log(results)

console.log(JSON.stringify(results))

