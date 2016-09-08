/**
 * Attaches behaviors for the Tracker module's History module integration.
 *
 * May only be loaded for authenticated users, with the History module enabled.
 */
(function ($, Drupal, window) {

    $( "#edit-settings-use-default-style-ignore-colors,#edit-settings-font-size,#block-form,#edit-settings-icon-color,#edit-settings-button-link-color,#edit-settings-spacing, #edit-settings-radius, #edit-settings-size" ).click(function() {
        update_icons();
    });

    update_icons();

    function update_icons(){
    var spacing = $( "#edit-settings-spacing").val() + 'px';
    var radius = $( "#edit-settings-radius").val() + 'px';
    var size = $( "#edit-settings-size").val() + 'px';
    var background = $( "#edit-settings-button-link-color").val();
    var color = $( "#edit-settings-icon-color").val();
    var font_size = $( "#edit-settings-font-size").val() + 'px';
    //var default_style = $('#edit-settings-use-default-style-ignore-colors').is(':checked');
    //var default_style = $('#edit-settings-use-default-style-ignore-colors').prop('checked');
    var default_style = document.getElementById('edit-settings-use-default-style-ignore-colors').checked;
        console.log(default_style + '--' + color);
    if(default_style == true){
        var color = '#ffffff';
        var background = 'auto';
    }else{
        var background = $( "#edit-settings-button-link-color").val();
        var color = $( "#edit-settings-icon-color").val();
    }

    console.log(default_style + '--' + color);

    $(".soc li a").css({
        "width": size,
        "height": size,
        "line-height": size,
        "font-size" : font_size,
        "-webkit-border-radius": radius,
        "-moz-border-radius": radius,
        "border-radius": radius,
        "margin-right": spacing,
        "color": color,
        "background-color": background
    });


    }

})(jQuery, Drupal, window);


//function simple_social_share_block_live_changes(field){
//    console.log(field.value)
//}


/*
width: 38px;
height: 38px;
line-height: 38px;

/*size 55%*
font-size: 20px;

/*Radius*
-webkit-border-radius: 25px;
-moz-border-radius: 25px;
border-radius: 25px;

/*Spacing*
margin-right: 7px;


 color: #ffffff;
 background-color: none;

*/