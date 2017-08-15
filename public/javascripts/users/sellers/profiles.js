$(document).ready(function () {
	// variables for toggling in seller dashboard
	var  toggleSharedProducts = $("#toggle-shared-products");
	var contSharedProducts = $("#cont-shared-products");
	var togglePostProduct = $("#toggle-post-product");
	var contPostProduct = $("#cont-post-product");
	var toggleMessages = $("#toggle-messages");
	var contMessages = $("#cont-messages");
	var toggleCredit = $("#toggle-credit");
	var contCredit = $("#cont-credit");
	$(".list-group .list-group-item").on("click", function () {
		$(this).addClass('active').siblings().removeClass("active");
	});
	toggleSharedProducts.on("click", function () {
		contSharedProducts.slideToggle(200).siblings(".toggling-cont").slideUp(200);
	});
	togglePostProduct.on("click", function () {
		contPostProduct.slideToggle(200).siblings(".toggling-cont").slideUp(200);
	});
	toggleMessages.on("click", function () {
		contMessages.slideToggle(200).siblings(".toggling-cont").slideUp(200);
	});
	toggleCredit.on("click", function () {
		contCredit.slideToggle(200).siblings(".toggling-cont").slideUp(200);
	});
	$(".new-product-options .new-product-options-title").hover(function () {
		$(".new-product-options .shake").addClass('shake').fadeIn(400);
	});
	$(".new-product-options div .new-product-option").on("click", function () {
		var categoryName = $(this).text();
		$(".new-product-options .shake input").val(categoryName);
		$(this).css({"color": "orangered"}).siblings().css({"color":"black"});
		$(this).hover(function () {
			$(this).toggleClass('.to');
		});
		$(".categoryName p").text(categoryName);
	});
	$(".remove-category").on("click", function () {
		$(".categoryName p").text("");
		$(".new-product-options .shake input").val("");
		$(".new-product-options .shake .new-product-option").css({"color":"black"});
	});
	$(".uploadNewProductImage").on("click", function () {
		$("#newProductImage").click();
	});
	$("#newProductImage").on("change", function (event) {
		var reader = new FileReader();
		reader.onload = function () {
			$("#livePreview").attr("src", reader.result);
		};
		reader.readAsDataURL(event.target.files[0]);
	});
	var productTitle = $("#productTitle");
	var productDescription = $("#productDescription");
	var categoryName = $("#categoryName");
	var newProductImage = $("#newProductImage");
	var as;
	if (productTitle.val() && productDescription.val() && categoryName.val() && newProductImage.val()) {
		as = true;
	}
	if (as == true) {
		$("#fake").css({"display":"none"});
		$(".real").css({"display":"block"});
	} else {
		as = false;
	}
		$("#fake").hover(function () {
			var as;
			if (productTitle.val() && productDescription.val() && categoryName.val() && newProductImage.val()) {
				as = true;
			}
			if (as == true) {
				$("#fake").css({"display":"none"});
				$(".real").css({"display":"block"});
			} else {
				$("#fake").fadeIn(200);
			}
		});
		$(".post-new-product input").keypress(function (e) {
			if (e.keyCode == 13 ) {
				if (as == false) {
					alert("هل كل الحقزل مملزئة");
					$(".post-new-product form").attr('method', "get");
				}
			}
		});
		$(".fa-pencil-square").on("click", function () {
			$(this).parents(".seller-posted-products").children('.seller-update-product').slideToggle(300);
		});
		$(".seller-update-product form .edit-product-categories h4").hover(function () {
			$(".seller-update-product form .edit-product-categories .shake").slideDown(200);
		});
		$(".seller-update-product form .edit-product-categories .category-name").on("click", function () {
		var categoryName = $(this).text();
		$(".seller-update-product form .edit-product-categories .shake input").val(categoryName);
		$(this).css({"color": "orangered"}).siblings().css({"color":"black"});
		$(this).hover(function () {
			$(this).toggleClass('.to');
		});
		$("#edit-product-category-name p").text(categoryName);
	});
	$("#edit-product-category-name .remove-category").on("click", function () {
		$("#edit-product-category-name p").text("");
		$(".seller-update-product form .edit-product-categories .shake input").val("");
		$(".seller-update-product form .edit-product-categories .category-name").css({"color":"black"});
	});
	$(".seller-change-image").on("click", function () {
		$(this).parents(".form-image").children(".product-new-image").click();
	});
	$(".product-new-image").on("change", function (event) {
		var reader = new FileReader();
		var inputImage = $(this);
		reader.onload = function () {
			$(inputImage).parents(".form-image").children('.product-image').children('img').attr("src", reader.result);
		};
		reader.readAsDataURL(event.target.files[0]);
	});
	$(".fa-times").on("click", function () {
		$(this).parents(".seller-posted-products").children('.seller-product-delete').children('input').click();
	});
});


 //|| $("#productDescription").val("") || $("#categoryName").val("") || $("#newProductImage").val("")
