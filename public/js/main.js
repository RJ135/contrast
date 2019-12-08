

// ====Gestion evenement 'Delete' jQuery et Ajax====
$(document).ready(()=>{

  

  $('.delete-article').on('click', function(e){
    $target = $(e.target)
    const id = $target.attr('data-id')
    $.ajax({
      type:'DELETE',
      url: '/articles/'+id,
      success: function(response){
        window.location.href='/'
      },
      error: function(err){
        console.log(err)
      }
    });
  });
});

// ====Décompte caractères====
var maxLength = 500;
$('#textareaChars').keyup(function() {
  var length = $(this).val().length;
  var length = maxLength-length;
  $('#chars').text(length);
})

// ====Upload image preview====
const reader = new FileReader();
reader.onload = function (e) {
    $('#photoPreview').attr('src', e.target.result);
}
   
function readURL(input) {
    if (input.files && input.files[0]) {
        reader.readAsDataURL(input.files[0]);
    }
}

$("#imgInpPreview").change(function(){
    readURL(this);
});

//==== Navbar change color ====
$(function () {
  $(document).scroll(function () {
    var $nav = $(".fixed-top");
    $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
  });
});

//===== Nav User Dropdown ====
$('ul.nav li.dropdown').hover(function() {
  $(this).find('.dropdown-menu').stop(true, true).delay(5).fadeIn(100);
}, function() {
  $(this).find('.dropdown-menu').stop(true, true).delay(5).fadeOut(100);
});
