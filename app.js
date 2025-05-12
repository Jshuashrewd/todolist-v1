const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://Jshuashrewd:Jshuashrewd@cluster0.a4f5svc.mongodb.net/todolistDB");
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", (req, res) => {

  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Successfully saved default items to DB");
          })
          .catch((err) => {
            console.log(err);
          }); 
          res.redirect("/");
      } else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    })
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
      item.save();
      res.redirect("/");
  } else {
    List.findOne({name: listName})
      .then((foundlist) => {
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/" + listName);
      })
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId)
      .then(() => {
        console.log("Successfully deleted checked item");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  
})

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize( req.params.customListName);

  List.findOne({name: customListName})
    .then((foundlist) => {
      if (!foundlist) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/work", (req, res) => {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
})

app.get("/about", (req,res) => {
  res.render("about");
})

app.listen(3000, () => {
  console.log("Sever started on port 3000");
})