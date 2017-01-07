

var SearchController = function() {

    var data = [
        {name: "xxx"},
        {name: "yyy"},
        {name: "ccc"},
    ];

    this.search = function(req, res) {
        console.log("SearchController search was called");
        res.json(data);
    }

}

module.exports = SearchController;

