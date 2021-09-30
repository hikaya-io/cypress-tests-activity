/// <reference types="Cypress" />

context("Registration", () => {
    let data;
    let env;

    before(() => {
        cy.fixture("test_data.json").then((test_data) => {
            data = test_data;
        });
        env = Cypress.env();
    });

    it("ACTATC-1.1 Register a New User", () => {
        cy.clearInbox();
        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.apiDeleteUser(data.un_new);
        cy.apiLogoutAdmin();

        cy.visit("/accounts/register/user/none/");
        cy.contains("Create an account").should("exist");
        // Visual test of the register page
        //  https://github.com/cypress-io/cypress/issues/3090
        // cy.get("body").toMatchImageSnapshot();

        cy.get("#register_first_name")
            .type(data.f_new)
            .should("have.value", data.f_new);
        cy.get("#register_last_name")
            .type(data.l_new)
            .should("have.value", data.l_new);
        cy.get("#register_username")
            .type(data.un_new)
            .should("have.value", data.un_new);
        cy.get("#register_password")
            .type(data.pw_new)
            .should("have.value", data.pw_new);
        cy.get("#register_confirm_password")
            .type(data.pw_new)
            .should("have.value", data.pw_new);
        cy.get("#register_submit_btn").should("be.disabled");
        cy.get("#register_email_address")
            .type(Cypress.env("mailslurp_inbox") + "@mailslurp.com")
            .should(
                "have.value",
                Cypress.env("mailslurp_inbox") + "@mailslurp.com"
            );
        cy.get("#register_submit_btn").should("be.enabled");
        cy.get("#register_submit_btn").click();

        cy.get("h1").should("contain", "Confirm Your Email Address");
        cy.get("p").should(
            "contain",
            "Proceed to your email account to confirm your email address to activate your account"
        );
        // cy.get("body").toMatchImageSnapshot();

        // Check that user cannot login without activated account
        cy.get(".form-group > .btn").click();
        cy.enterLoginDetails(data.un_new, data.pw_new);
        cy.get(".alert").should(
            "contain",
            "Please verify your email address then try again."
        );
        // cy.get(
        //     ".activity-content #alerts .alert-danger"
        // ).toMatchImageSnapshot();

        cy.getLinkFromEmail(
            "Please confirm your email address",
            "Confirm email",
            0
        ).then((link) => {
            cy.visit(link);
            cy.get(".alert").should(
                "contain",
                "Thanks, your email address has been confirmed"
            );

            // Check that activation link is now invalid
            cy.visit(link);
            cy.contains("Activation link is invalid!");
        });

        cy.getLinkFromEmail(
            "Welcome to Activity",
            "Log in to Activity",
            1
        ).then((link) => {
            expect(link).to.eq(Cypress.config().baseUrl + "/accounts/login/");
            cy.apiLogin(data.un_new, data.pw_new);
            cy.visit("/accounts/register/organization");
            cy.contains("Create an Organization");
        });
    });

    it("ACTATC-1.2 Create a New Organization", () => {
        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.apiDeleteUser(data.un_new);
        cy.apiAddUser(
            data.un_new,
            data.pw_new,
            Cypress.env("mailslurp_inbox") + "@mailslurp.com"
        );
        cy.apiLogoutAdmin();

        cy.apiLogin(data.un_new, data.pw_new);
        cy.visit("/accounts/register/organization");
        cy.contains("Create an Organization");
        // cy.get("body").toMatchImageSnapshot();

        cy.get("#org_name")
            .type("The New Aid Organization")
            .should("have.value", "The New Aid Organization");
        cy.get("#activity_url").should(
            "have.value",
            "www.activity.hikaya.io/the-new-aid-organization"
        );
        cy.get("#description")
            .type(
                "TNAO is a nobal organization with reall results in the community"
            )
            .should(
                "have.value",
                "TNAO is a nobal organization with reall results in the community"
            );
        cy.get("#org_url")
            .type("www.tnao.org")
            .should("have.value", "www.tnao.org");
        cy.get("#location")
            .type("Capital of the World")
            .should("have.value", "Capital of the World");
        cy.get("#orgFormSubmitBtn").click();

        cy.get(".navbar-right > .dropdown > .dropdown-toggle").click();

        cy.get(".dropdown > .dropdown-menu > .active > a").should(
            "contain",
            "The New Aid Organization"
        );

        // Visual test of the dropdown menu
        // cy.get(
        //     ".navbar-right > .dropdown > .dropdown-menu"
        // ).toMatchImageSnapshot();
    });
});
