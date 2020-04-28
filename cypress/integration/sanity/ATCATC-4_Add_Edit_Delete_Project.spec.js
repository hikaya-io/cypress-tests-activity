/// <reference types="Cypress" />

context("Project creation, update and deletion", () => {
    let data;
    let env;

    before(() => {
        cy.fixture("test_data.json").then((test_data) => {
            data = test_data;
        });
        env = Cypress.env();
    });

    beforeEach(() => {
        cy.apiDeleteProject(data.main_program, [
            data.new_project.name,
            `${data.new_project.name} 01`,
            `${data.new_project.name} Edited`,
        ]);
    });

    it("ACTATC-2.1 Adds a New Project", () => {
        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.visit("workflow/level2/list/0/none/");

        cy.get(".page-title").should("contain", "Projects List");
        cy.get(`a[title='${data.new_project.name}']`).should("not.exist");
        cy.get(`a[title='${data.new_project.name + " 01"}']`).should(
            "not.exist"
        );

        cy.get("[data-target='#addProjectModal']").click();
        cy.get("#addProjectModalLabel").should("contain", "Create Projects");
        cy.enterProject(data.new_project.name, data.main_program);
        cy.get(".btn-close")
            .contains("Cancel")
            .click();
        cy.get(`a[title='${data.new_project.name}']`).should("not.exist");

        cy.get("[data-target='#addProjectModal']").click();
        cy.get("#addProjectModalLabel").should("contain", "Create Projects");
        cy.enterProject(data.new_project.name, data.main_program);
        // Detecting page reload after "Save $ New"
        cy.window().then((w) => (w.beforeReload = true));
        // initially the new property in the window
        cy.window().should("have.prop", "beforeReload", true);
        cy.get("#submitProjectAndNew").click();

        // Inconsistent behaviour of toast message
        // cy.get(".toast-message").should(
        //     "contain",
        //     "Project was added sucessfully"
        // );
        // after reload the property should be gone
        cy.window().should("not.have.prop", "beforeReload");
        cy.enterProject(data.new_project.name + " 01", data.main_program);
        cy.get("#submitProject").click();

        // Inconsistent behaviour of toast message
        // cy.get(".toast-message").should(
        //     "contain",
        //     "Project was added sucessfully"
        // );
        cy.get("#addProjectModal > .modal-dialog").should("not.be.visible");

        cy.get(`a[title='${data.new_project.name}']`).should("exist");
        cy.get(`a[title='${data.new_project.name + " 01"}']`).should("exist");
    });

    it("ACTATC-2.2 Edits a Project", () => {
        let project = data.new_project;
        cy.apiGetProgramIds([data.main_program]).then(() => {
            cy.get("@project_ids").then((ids) => {
                project.program = ids[0];
            });
        });
        cy.apiAddProject(project);

        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.visit("/workflow/level2/list/0/none/");

        cy.get(`a[title='${project.name}']`).click();

        cy.get(".page-title").should("contain", project.name);

        cy.get("#id_project_name").type(" Edited");
        cy.get("#id_activity_code").type("cy-001");
        cy.get(".btn")
            .contains("Cancel")
            .click();

        cy.get(`a[title='${project.name}']`).should("exist");
        cy.get(`a[title='${project.name}']`)
            .parent("td")
            .next()
            .should("contain", "None");

        cy.get(`a[title='${project.name}']`).click();

        cy.get(".page-title").should("contain", project.name);
        cy.get("#id_project_name").type(" Edited");
        cy.get("#id_activity_code").type("cy-001");
        cy.get(".btn")
            .contains("Save")
            .click();

        // Success message very generic:
        cy.get(".alert").should("contain", "Success, form updated!");

        cy.visit("/workflow/level2/list/0/none/");
        cy.get(`a[title='${project.name} Edited']`).should("exist");
        cy.get(`a[title='${project.name} Edited']`)
            .parent("td")
            .next()
            .should("contain", "cy-001");
    });

    it("ACTATC-2.3 Deletes a Project", () => {
        let project = data.new_project;
        cy.apiGetProgramIds([data.main_program]).then(() => {
            cy.get("@project_ids").then((ids) => {
                project.program = ids[0];
            });
        });
        cy.apiAddProject(project);

        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.visit("/workflow/level2/list/0/none/");

        cy.get(`a[title='${project.name}']`)
            .parent("td")
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get(`a[title='${project.name}']`)
            .parent("td")
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Delete")
            .click();

        cy.get(".modal-header").should("contain", "Confirm Delete");
        cy.contains(
            `Are you sure you want to delete "${project.name}"?`
        ).should("exist");

        cy.get(".btn-danger")
            .contains("Delete")
            .click();

        cy.get(".toast-message").should(
            "have.text",
            "You have successfull deleted this item"
        );
        cy.get(`a[title='${project.name}']`).should("not.exist");
    });
});
