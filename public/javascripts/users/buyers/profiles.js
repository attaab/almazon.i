$(document).ready(function () {
	var togglePurchases = $("#toggle-purchases");
	var contPurchases = $("#cont-purchases");
	var toggleBasket = $("#toggle-basket");
	var contBasket = $("#cont-basket");
	var toggleMessages = $("#toggle-messages");
	var contMessages = $("#cont-messages");
	var toggleCredit = $("#toggle-credit");
	var contCredit = $("#cont-credit");
	$(".list-group .list-group-item").on("click", function () {
		$(this).addClass('active').siblings().removeClass("active");
	});
	togglePurchases.on("click", function () {
		contPurchases.slideToggle(200).siblings(".toggling-cont").slideUp(200);
	});
	toggleBasket.on("click", function () {
		contBasket.slideToggle(200).siblings(".toggling-cont").slideUp(200);
	});
	toggleMessages.on("click", function () {
		contMessages.slideToggle(200).siblings(".toggling-cont").slideUp(200);
	});
	toggleCredit.on("click", function () {
		contCredit.slideToggle(200).siblings(".toggling-cont").slideUp(200);
	});
	
	$(".uploadid").on("click", function () {
		$("#sellerimg").click();
	});
		var alertCompany = $("#alert-company");
		var alertSellerId = $("#alert-sellerId");
		var isValid;
		$("#sellerId").on("blur", function () {
			if (!$("#sellerId").val()) {
				alertSellerId.fadeIn(200);
				alertSellerId.text("يجب ادخال معرف البطاقة الحقيقي حتى يتم حفظ المعلومات بنجاح");
			} else {
				alertSellerId.text("");
				alertSellerId.fadeOut(200);
			}
		});
		$("#companyname").on("blur", function () {
			if (!$("#companyname").val()) {
				alertCompany.fadeIn(200);
				alertCompany.text("يجب إدخال هذا الحقل حتى تحفظ المعلومات بنجاح");
			} else {
				alertCompany.text("");
				alertCompany.fadeOut(200);
			}
		});
});