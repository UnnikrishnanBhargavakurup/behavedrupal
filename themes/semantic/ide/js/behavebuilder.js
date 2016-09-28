/**
 * Define all the prototypes for constructs we used in workspece here.
 */
function Base() {
  this.id = 0;
  this.items = {};
  this.activeItem = null;
  this.item_names = {};

  /**
   * add an item.
   */  
  this.add = function (name) {
    if(!this.item_names.hasOwnProperty(name)) {
      this.items[this.id] = {
        "name" : name,
        "id" : this.id
      };
      this.activeFeature = this.items[name];
      this.item_names[name] = this.id;
      this.id++;
    }
    else {
      //rease error
    }
  }

  /**
   * delete an item.
   */  
  this.delete = function(id) {
    delete this.items[id];
    var keys = Object.keys(this.items);
    // make active item to the last avilable item
    this.activeItem = keys.length > 0 ? this.items[keys[keys.length - 1]] : null;
  }

  /**
   * Set active item.
   */
  this.setActive = function(id) {
    if(this.items.hasOwnProperty(id)) {
      this.activeItem = this.items[id];
    }
    else {

    }
  }
}

var WorkArea = new Base();
var Feature = new Base();
var Scenario = new Base();

/**
 * Action object
 */
var Action = function(name) {
  this.name = name;
}


WorkArea.add("feature1");