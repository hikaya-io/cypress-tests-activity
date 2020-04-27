const { MailSlurp } = require("mailslurp-client");
const JSSoup = require("jssoup").default;

const mailslurp = new MailSlurp({
    apiKey: Cypress.env("api_key_mailslurp"),
});

// Generate a random email
Cypress.Commands.add("newEmailAddress", () => {
    return mailslurp.createInbox();
});

// Fetch email by it index (0 based index)
Cypress.Commands.add("getEmail", (count) => {
    const email = mailslurp.waitForNthEmail(
        Cypress.env("mailslurp_inbox"),
        count,
        10000
    );
    return email;
});

// Extract notifcation link from email
Cypress.Commands.add("getLinkFromEmail", (subject, link_title, count) => {
    cy.getEmail(count).then((email) => {
        expect(email.subject).to.equal(subject);
        const soup = new JSSoup(email.body);
        const links = soup.findAll("a");
        let link_found;

        links.forEach((link) => {
            if (link.attrs.title == link_title) {
                link_found = link.attrs.href;
            }
        });

        if (link_found) {
            return link_found;
        } else {
            expect(link_found).to.not.equal(undefined);
        }
    });
});

// Fetch all emails from inbox
Cypress.Commands.add("getEmails", () => {
    const inbox = mailslurp.getEmails(Cypress.env("mailslurp_inbox"));
    return inbox;
});

// Clear inbox (deleting all emails)
Cypress.Commands.add("clearInbox", () => {
    mailslurp.emptyInbox(Cypress.env("mailslurp_inbox"));
});

// Login via the UI
Cypress.Commands.add("login", (email, password) => {
    cy.enterLoginDetails(email, password);
    cy.url().should("include", "/dashboard");
});

Cypress.Commands.add("enterLoginDetails", (email, password) => {
    cy.visit("/accounts/login");
    cy.get("#login_username")
        .type(email)
        .should("have.value", email);
    cy.get("#login_password")
        .type(password)
        .should("have.value", password);
    cy.get("#login_submit_btn").click();
});

// Create an Project
Cypress.Commands.add("addProject", (name, program) => {
    cy.get("[data-target='#addProjectModal']").click();
    cy.get("#addProjectModalLabel").should("contain", "Create Projects");
    cy.enterProject(name, program);
    cy.get("#submitProject").click();

    // Inconsistent behaviour of toast message
    // cy.get(".toast-message").should(
    //     "contain",
    //     "Project was added sucessfully"
    // );
});

// Enter Project details
Cypress.Commands.add("enterProject", (name, program) => {
    cy.get("#id_project_name")
        .invoke("val", name)
        .should("have.value", name);
    cy.get(".select2-selection")
        .click()
        .then(() => {
            cy.get(".select2-results__option")
                .contains(program.substring(0, 49))
                .click();
        });
});

// Create an indicator
Cypress.Commands.add("addIndicator", (name, program) => {
    cy.get(".btn")
        .contains("Indicators")
        .click();
    cy.get(".modal-header").should("contain", "New Indicator");
    cy.enterIndicator(name, program);
    cy.get("#createNewIndicator").click();
});

// Enter Indicator details
Cypress.Commands.add("enterIndicator", (name, program) => {
    cy.get("#indicatorName")
        .invoke("val", name)
        .should("have.value", name);
    cy.get(".select2-selection")
        .click()
        .then(() => {
            cy.get(".select2-results__option")
                .contains(program)
                .click();
        });
});
