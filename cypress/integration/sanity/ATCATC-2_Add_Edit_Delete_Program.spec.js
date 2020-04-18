/// <reference types="Cypress" />

context("Program creation, update and delition", () => {
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
        cy.deleteProgram([data.new_program, data.new_program + " 01"]);

        cy.loginByCSRF(env.un_qa_org, env.pw_qa_org);

        cy.visit("/");
        cy.get(".dropdown")
            .contains("Workflow")
            .click()
            .then(() => {
                cy.get("a")
                    .contains("Programs")
                    .click();
                cy.get(".page-title").should("contain", "Programs List");
            });
        cy.get("#show-modal").click();
        enterProgramDetails(data.new_program, data.sector_DRR);

        cy.get(".btn-close").click();
        cy.get("#level_1_list")
            .find(`a[title='${data.new_program}']`)
            .should("not.exist");

        cy.get("#show-modal").click();
        enterProgramDetails(data.new_program, data.sector_DRR);
        cy.get(".btn-outline-success").click();
        cy.get(".toast-message").should(
            "have.text",
            "Programs successfully saved"
        );

        enterProgramDetails(data.new_program + " 01", data.sector_DRR);
        cy.get(".btn-success").click();
        cy.get(".toast-message").should(
            "have.text",
            "Programs successfully saved"
        );

        cy.get("#level_1_list")
            .find(`a[title='${data.new_program}']`)
            .should("exist");
        cy.get("#level_1_list")
            .find(`a[title='${data.new_program + " 01"}']`)
            .should("exist");
    });

    it("ACTATC-2.2 Edit a New Program", () => {
        const program_name = data.new_program + " Edit";
        cy.deleteProgram([program_name]);

        cy.loginByCSRF(env.un_qa_org, env.pw_qa_org);

        cy.visit("/workflow/level1_list");
        cy.get(".page-title").should("contain", "Programs List");

        cy.get("#show-modal").click();
        enterProgramDetails(program_name, data.sector_ET);

        cy.get(".btn-success").click();
        cy.get(".toast-message").should(
            "have.text",
            "Programs successfully saved"
        );

        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .should("exist");

        cy.get("a")
            .contains(program_name)
            .click();

        cy.get(".page-title").should("contain", program_name);
        cy.get("#id_description").type(data.new_program_desc);
        cy.get("a")
            .contains("Cancel")
            .click();

        cy.get(".page-title").should("contain", "Programs List");
        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .should("exist");

        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Edit")
            .click();

        cy.get(".page-title").should("contain", program_name);
        cy.get("#id_description").should("be.empty");
        cy.get("#id_description").type(data.new_program_desc);

        cy.get(".text-right > .btn-success").click();

        cy.get(".page-title").should("contain", "Programs List");
        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .should("exist");

        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Edit")
            .click();

        cy.get(".page-title").should("contain", program_name);
        cy.get("#id_description").should("have.value", data.new_program_desc);
    });

    it("ACTATC-2.3 Delete a New Program", () => {
        const program_name = data.new_program + " Delete";
        cy.deleteProgram([program_name]);

        cy.loginByCSRF(env.un_qa_org, env.pw_qa_org);

        cy.visit("/workflow/level1_list");
        cy.get(".page-title").should("contain", "Programs List");

        cy.get("#show-modal").click();
        enterProgramDetails(program_name, data.sector_Education);

        cy.get(".btn-success").click();
        cy.get(".toast-message").should(
            "have.text",
            "Programs successfully saved"
        );

        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .should("exist");

        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Delete")
            .click();

        cy.get(".modal-header").should("contain", "Confirm delete");
        cy.contains(`Are you sure you want to delete ${program_name}?`).should(
            "exist"
        );

        cy.get(".btn-close").click();

        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get("#level_1_list")
            .find(`a[title='${program_name}']`)
            .parent()
            .siblings(".text-right")
            .find(".dropdown-menu")
            .find("li > a")
            .contains("Delete")
            .click();

        cy.get(".modal-header").should("contain", "Confirm delete");
        cy.contains(`Are you sure you want to delete ${program_name}?`).should(
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
            .find(`a[title='${program_name}']`)
            .should("not.exist");
    });
});
