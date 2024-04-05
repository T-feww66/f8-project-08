function Validator(formSelector, option = {}) {
    // fuction parentElement
    var getParent = (element, selector) => {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    };
    // có một form rules là một obj chứa tất cả các rules của input
    var formRules = {
        // // kỳ vọng trả về một mảng các fuction
        // fullname: f(),
        // email: "required|email",
    };

    // validator rules
    var validatorRules = {
        required: (value) => {
            return value ? undefined : "Vui lòng nhập trường này";
        },
        email: (value) => {
            var regex =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(value) ? undefined : "Email không hợp lệ";
        },
        min: (min) => {
            return (value) => (value.length >= min ? undefined : `Vui lòng nhập it nhất ${min} ký tự`);
        },

        max: (max) => {
            return (value) => (value.length <= max ? undefined : `Vui lòng nhập tối thiểu ${max} ký tự`);
        },
    };

    // Lấy element của form
    var formElement = document.querySelector(formSelector);

    // chỉ xữ lý khi có formElement trong DOM
    if (formElement) {
        // Lấy ra tất cả các thẻ input có name và rules
        var inputs = formElement.querySelectorAll("input[name][rules]");
        // lặp qua inputs
        for (var input of inputs) {
            // lay ra tung rule trong rules
            var rules = input.getAttribute("rules").split("|");

            for (var rule of rules) {
                // kiểm tra xem trong rule có dấu : hay không\
                // nếu mà có dấu : thì cắt ra thành một mãng
                // và ráng cho mảng đó thành giá trị đầu tiên của mảng
                var isRuleHasValue = rule.includes(":");
                var ruleInfo;
                if (isRuleHasValue) {
                    ruleInfo = rule.split(":"); //[]
                    rule = ruleInfo[0];
                }
                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]); // ruleFucn(6)
                }

                // đưa tất cả các fuction vào trong formRules[input.name]
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }

            // lắng nghe sự kiện blur change

            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        // Hàm xữ lý lỗi
        function handleValidate(e) {
            var rules = formRules[e.target.name];
            var errorMessage;
            rules.some((rule) => {
                errorMessage = rule(e.target.value);
                return errorMessage;
            });

            // nếu có lỗi
            if (errorMessage) {
                var formGroup = getParent(e.target, ".form__group");
                if (formGroup) {
                    var formMessage = formGroup.querySelector(".form__message");
                    formGroup.classList.add("invalid");
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }

            return errorMessage;
        }

        // Hàm Clear message lỗi
        function handleClearError(e) {
            var formGroup = getParent(e.target, ".form__group");

            if (formGroup.classList.contains("invalid")) {
                formGroup.classList.remove("invalid");
                var formMessage = formGroup.querySelector(".form__message");
                if (formMessage) {
                    formMessage.innerText = "";
                }
            }
        }
    }

    // xữ lý hành vi submit form

    formElement.onsubmit = (e) => {
        e.preventDefault();

        var inputs = formElement.querySelectorAll("input[name][rules]");
        var isValid = false;
        // lặp qua inputs
        for (var input of inputs) {
            if (handleValidate({ target: input })) {
                isValid = true;
            }
        }

        if (!isValid) {
            if (typeof option.onSubmit === "function") {
                // lấy tất cả các input có name
                var enableInputs = formElement.querySelectorAll("input[name]");
                // chuyển về data type array để sữ dụng được arr
                var formValues = Array.from(enableInputs).reduce((values, input) => {
                    values[input.name] = input.value;
                    return values;
                }, {});

                option.onSubmit(formValues);
            } else {
                formElement.submit();
            }
        }
    };
    console.log(formRules);
}
