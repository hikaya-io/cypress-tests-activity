/// <reference types="Cypress" />

context("Program creation, update and deletion", () => {
    let data;
    let env;

    const enterProgramDetails = (name, sector) => {
        const today = new Date();
        const today1 = new Date();

        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();
        today1.setMonth(today1.getMonth() + 1);
        let ddE = today1.getDate();
        let mmE = today1.getMonth() + 1;
        const yyyyE = today1.getFullYear();

        if (mmE < 10) {
            mmE = `0${mmE}`;
        }
        const start = `${yyyy}-${`0${mm}`.substring(
            `0${mm}`.length - 2,
            `0${mm}`.length
        )}-${`0${dd}`.substring(`0${dd}`.length - 2, `0${dd}`.length)}`;
        const end = `${yyyyE}-${`0${mmE}`.substring(
            `0${mmE}`.length - 2,
            `0${mmE}`.length
        )}-${`0${ddE}`.substring(`0${ddE}`.length - 2, `0${ddE}`.length)}`;

        cy.get(".modal-header").should("contain", "Add Programs");

        cy.get("input[name='name']")
            .type(name)
            .should("have.value", name);
        cy.get(".vs__search").click();
        cy.get("[role='listbox']")
            .find("li")
            .contains(sector)
            .click();
        cy.get(".vs__selected").contains(sector);

        cy.get("#startDate").type(start);
        cy.get("#endDate").type(end);

        // [TODO]: Validate start and end dates limits
        // cy.get("a[title='Prev']").click();
        // cy.get("a[title='Prev']").should("have.class", "ui-state-disabled");

        // cy.get("#startDate").click();
        // cy.get("a[title='Next']").click();
        // cy.get("a[title='Next']").should("have.class", "ui-state-disabled");
    };

    before(() => {
        cy.fixture("test_data.json").then((test_data) => {
            data = test_data;
        });
        env = Cypress.env();
    });

    it("ACTATC-2.1 Adds a New Program", () => {
        let program = data.new_program.name;
        cy.apiDeleteProgram([program, program + " 01"]);

        cy.apiLogin(env.un_qa_org, env.pw_qa_org);

        cy.visit("/");
        cy.get(".dropdown")
            .contains("Workflows")
            .click()
            .then(() => {
                cy.get("a")
                    .contains("Programs")
                    .click();
                cy.get(".page-title").should("contain", "Programs List");
            });
        cy.get("#show-modal").click();
        enterProgramDetails(program, data.sector_DRR);

        cy.get(".btn-close").click();
        cy.get("#level_1_list")
            .find(`a[title='${program}']`)
            .should("not.exist");

        cy.get("#show-modal").click();
        enterProgramDetails(program, data.sector_DRR);
        cy.get(".btn-outline-success").click();
        cy.get(".toast-message").should(
            "have.text",
            "Programs successfully saved"
        );

        enterProgramDetails(program + " 01", data.sector_DRR);
        cy.get(".btn-success").click();
        cy.get(".toast-message").should(
            "have.text",
            "Programs successfully saved"
        );

        cy.get("#level_1_list")
            .find(`a[title='${program}']`)
            .should("exist");
        cy.get("#level_1_list")
            .find(`a[title='${program + " 01"}']`)
            .should("exist");
    });

    it("ACTATC-2.2 Edits a Program", () => {
        let program = data.new_program;
        program.sector = 1;
        program.organization = 1;

        cy.apiDeleteProgram([program.name]);
        cy.apiAddProgram(program);

        cy.apiLogin(env.un_qa_org, env.pw_qa_org);

        cy.visit("/workflow/level1_list");

        cy.get("#level1Table")
            .find("a")
            .contains(program.name)
            .click();

        cy.get(".page-title").should("contain", program.name);
        cy.get("#id_description").type(" new desc");
        cy.get("a")
            .contains("Cancel")
            .click();

        cy.get(".page-title").should("contain", "Programs List");
        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .should("exist");

        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Edit")
            .click();

        cy.get(".page-title").should("contain", program.name);
        cy.get("#id_description").should("have.value", program.description);
        cy.get("#id_description").type(" new desc");

        cy.get(".text-right > .btn-success").click();

        cy.get(".page-title").should("contain", "Programs List");
        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .should("exist");

        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Edit")
            .click();

        cy.get(".page-title").should("contain", program.name);
        cy.get("#id_description").should(
            "have.value",
            `${program.description} new desc`
        );
    });

    it("ACTATC-2.3 Deletes a Program", () => {
        let program = data.new_program;
        program.sector = 1;
        program.organization = 1;

        cy.apiDeleteProgram([program.name]);
        cy.apiAddProgram(program);

        cy.apiLogin(env.un_qa_org, env.pw_qa_org);

        cy.visit("/workflow/level1_list");
        cy.get(".page-title").should("contain", "Programs List");

        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .should("exist");

        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .parent("td")
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Delete")
            .click();

        cy.get(".modal-header").should("contain", "Confirm delete");
        cy.contains(`Are you sure you want to delete ${program.name}?`).should(
            "exist"
        );

        cy.get(".btn-close").click();

        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .parent("td")
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Delete")
            .click();

        cy.get(".modal-header").should("contain", "Confirm delete");
        cy.contains(`Are you sure you want to delete ${program.name}?`).should(
            "exist"
        );

        cy.get("button")
            .contains("Delete")
            .click();

        cy.get(".toast-message").should(
            "have.text",
            "Programs was successfully Deleted"
        );

        cy.get("#level_1_list")
            .find(`a[title='${program.name}']`)
            .should("not.exist");
    });
});
