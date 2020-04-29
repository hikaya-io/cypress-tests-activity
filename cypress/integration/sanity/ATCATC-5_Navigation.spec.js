/// <reference types="Cypress" />

context("Navigating using dropdown menu", () => {
    let env;
    before(() => {
        env = Cypress.env();
    });

    beforeEach(() => {
        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.visit("/");
    });

    const menuNavigation = (menu, submenu, title, clases = "") => {
        cy.get(`${clases}.dropdown-toggle`)
            .contains(menu)
            .click();
        cy.get(".dropdown-menu > li")
            .contains(submenu)
            .click();

        if (clases === "") {
            cy.get(".dropdown-toggle")
                .contains(menu)
                .parent()
                .should("have.class", "active");
        }

        cy.get(".page-title").should("contain", title);
    };

    it("ACTATC-5.1 Navigates using the Workflows menu", () => {
        // Landing Page
        cy.get(".page-title").should("contain", "My Dashboard");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='modal']")
            .contains("Programs")
            .should("exist");
        // Programs Page
        menuNavigation("Workflows", "Programs", "Programs List");
        cy.get("#show-modal").should("contain", "Programs");

        // Projects Page
        menuNavigation("Workflows", "Projects", "Projects List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Projects Status")
            .should("exist");
        cy.get("button[data-toggle='modal']")
            .contains("Projects")
            .should("exist");
    });

    it("ACTATC-5.2 Navigates using the Indicator menu", () => {
        // Indicators Page
        menuNavigation("Indicators", "Indicators", "Indicators List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='modal']")
            .contains("Indicators")
            .should("exist");

        // Objectives Page
        menuNavigation("Indicators", "Objectives", "Objective List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("#show-modal").should("contain", "Objective");
    });

    it("ACTATC-5.3 Navigates using the Form Library menu", () => {
        // Individuals Page
        menuNavigation("Form Library", "Individuals", "Individuals List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Training")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Distribution")
            .should("exist");
        cy.get("button[data-toggle='modal']")
            .contains("Individual")
            .should("exist");

        // Distribution Page
        menuNavigation("Form Library", "Distribution", "Distribution List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Projects")
            .should("exist");
        cy.get("button[data-toggle='modal']")
            .contains("Distribution")
            .should("exist");

        // Training Page
        menuNavigation("Form Library", "Training", "Training List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Projects")
            .should("exist");
        cy.get("button[data-toggle='modal']")
            .contains("Training")
            .should("exist");
    });

    it("ACTATC-5.4 Navigates using the Components menu", () => {
        // Contacts Page
        menuNavigation("Components", "Contacts", "Contact List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Stakeholder")
            .should("exist");
        cy.get("button[data-toggle='modal']")
            .contains("Contact")
            .should("exist");

        // Documents Page
        menuNavigation("Components", "Documents", "Document List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Projects")
            .should("exist");
        cy.get("#show-modal").should("contain", "Document");

        // Locations Page
        menuNavigation("Components", "Locations", "Locations List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Site Status")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Projects")
            .should("exist");
        cy.get("button[data-toggle='modal']")
            .contains("Locations")
            .should("exist");

        // Stakeholders Page
        menuNavigation("Components", "Stakeholders", "Stakeholder List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Programs")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Projects")
            .should("exist");
        cy.get("a[data-toggle='modal']")
            .contains("Stakeholders")
            .should("exist");
    });

    it("ACTATC-5.5 Navigates using the Reports menu", () => {
        // Dashboards Page
        menuNavigation("Reports", "Dashboards", "Dashboard List");
        cy.get("button[data-toggle='dropdown']")
            .contains("Filter by Sector")
            .should("exist");
        cy.get("button[data-toggle='dropdown']")
            .contains("Filter by Countries")
            .should("exist");
    });

    it("ACTATC-5.6 Navigates using the User Avatar menu", () => {
        // Profile Page
        menuNavigation(
            env.fn_qa_org[0],
            "Profile",
            "My Profile",
            ".navbar-right > .dropdown > "
        );
        cy.get(".btn")
            .contains("Change Password")
            .should("exist");

        // Organization Settings Page
        menuNavigation(
            env.fn_qa_org[0],
            "Organization Settings",
            "Organization Settings",
            ".navbar-right > .dropdown > "
        );
    });
});
