document.addEventListener("DOMContentLoaded", function() {
    const sellingDiv = document.createElement('div');
    sellingDiv.className = 'selling';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'header';
    sellingDiv.appendChild(headerDiv);

    // Create the Previous link
    const previousLink = document.createElement('a');
    previousLink.href = "#";
    previousLink.className = "previous round";
    previousLink.innerHTML = "&#8249;";
    sellingDiv.appendChild(previousLink);


    const welcomeMessage = document.createElement('h2');
    welcomeMessage.textContent = "Welcome to the Lost IDs Page!";
    sellingDiv.appendChild(welcomeMessage);

    
    const descriptionPara = document.createElement('p');
    descriptionPara.textContent = "Found a lost ID? Add the name seen on the ID, the initials, and upload a picture. We will send an email to all users who match these initials. We’ll find them and let them contact you!";
    sellingDiv.appendChild(descriptionPara);

    
    const form = document.createElement('form');

    
    const nameFormGroup = document.createElement('div');
    nameFormGroup.className = 'form-group';

    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'name');
    nameLabel.textContent = 'Full Name';
    nameFormGroup.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'name';
    nameInput.name = 'name';
    nameInput.placeholder = 'Enter the full name seen on the ID';
    nameInput.required = true;
    nameFormGroup.appendChild(nameInput);

    form.appendChild(nameFormGroup);

    
    const initialsFormGroup = document.createElement('div');
    initialsFormGroup.className = 'form-group';

    const initialsLabel = document.createElement('label');
    initialsLabel.setAttribute('for', 'description');
    initialsLabel.textContent = 'Initials';
    initialsFormGroup.appendChild(initialsLabel);

    const initialsTextarea = document.createElement('textarea');
    initialsTextarea.id = 'description';
    initialsTextarea.name = 'description';
    initialsTextarea.placeholder = 'Add the initials of the ID (e.g: Roy A. Farhat --> R.A.F)';
    initialsTextarea.rows = 4;
    initialsTextarea.maxLength = 500;
    initialsTextarea.required = true;
    initialsFormGroup.appendChild(initialsTextarea);

    form.appendChild(initialsFormGroup);

    //POST button
    const postButton = document.createElement('button');
    postButton.type = 'submit';
    postButton.className = 'post-button';
    postButton.style.backgroundColor = '#3d3d3d';
    postButton.textContent = 'POST';
    form.appendChild(postButton);

    //error message paragraph
    const errorMessage = document.createElement('p');
    errorMessage.className = 'message-error';
    form.appendChild(errorMessage);

    
    sellingDiv.appendChild(form);

    
    document.body.appendChild(sellingDiv);
});
