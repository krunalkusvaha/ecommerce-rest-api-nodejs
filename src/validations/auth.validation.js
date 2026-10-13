const validateRegister = (req, res, next) => {
  const {name, email, password, phone, } = req.body;
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = "Name is required";
  } else if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (name.trim().length > 100) {
    errors.name = "Name must not exceed 100 characters";
  }

  if (!email || !email.trim()) {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    } else if (email.trim().length > 150) {
      errors.email = "Email must not exceed 150 characters";
    }
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (phone !== undefined && phone !== null) {
    if (String(phone).trim().length > 20) {
      errors.phone = "Phone number must not exceed 20 characters";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Please correct the validation errors",
      errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const {email, password, } = req.body;
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = "Email is required";
  }

  if (!password) {
    errors.password = "Password is required";
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Please enter your email and password",
      errors,
    });
  }

  next();

};

const validateUpdateProfile = (req, res, next) => {
  const {name, email, phone, address, gender, } = req.body;
  const errors = {};

  /*
  * Name
  */
  if (name !== undefined) {
    if (!String(name).trim()) {
      errors.name = "Name cannot be empty";
    } else if (String(name).trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (String(name).trim().length > 100) {
      errors.name = "Name must not exceed 100 characters";
    }
  }

  /*
  * Email
  */
  if (email !== undefined) {
    if (!String(email).trim()) {
      errors.email = "Email cannot be empty";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       
      if (!emailRegex.test(String(email).trim())) {
        errors.email = "Please enter a valid email address";
      } else if (String(email).trim().length > 150) {
        errors.email = "Email must not exceed 150 characters";
      }
    }
  }

  /*
  * Phone
  */
  if (phone !== undefined) {
    const phoneValue = String(phone).trim();

    if (phoneValue.length > 20) {
      errors.phone = "Phone number must not exceed 20 characters";
    } else if (phoneValue && !/^[0-9+\-\s()]{7,20}$/.test(phoneValue)) {
      errors.phone = "Please enter a valid phone number";
    }
  }

  /*
  * Address
  */
  if (address !== undefined) {
    if (String(address).trim().length > 255) {
      errors.address = "Address must not exceed 255 characters";
    }
  }

  /*
  * Gender
  */
  if (gender !== undefined) {
    const allowedGenders = ["male", "female", "other", ];

    if (!allowedGenders.includes(String(gender).toLowerCase())) {
      errors.gender = "Gender must be male, female, or other";
    }
  }

  /*
  * Only these fields are allowed.
  */
  const allowedFields = ["name", "email", "phone", "address", "gender", ];
  const submittedFields = Object.keys(req.body);
  const invalidFields = submittedFields.filter((field) => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    errors.fields = `The following fields cannot be updated here: ${invalidFields.join(", ")}`;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
    success: false,
    message: "Please correct the validation errors",
    errors,
    });
  }
    next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
};