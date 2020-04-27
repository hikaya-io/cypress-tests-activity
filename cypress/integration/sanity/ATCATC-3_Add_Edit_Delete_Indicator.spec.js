/// <reference types="Cypress" />

context("Indicator creation, update and deletion", () => {
    let data;
    let env;

    before(() => {
        cy.fixture("test_data.json").then((test_data) => {
            data = test_data;
        });
        env = Cypress.env();
    });

    beforeEach(() => {
        cy.apiDeleteIndicator([
            data.new_indicator.name,
            `${data.new_indicator.name} 01`,
            `${data.new_indicator.name} Edited`,
        ]);
    });

    it("ACTATC-2.1 Adds a New Indicator", () => {
        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.visit("/indicators/home/0/0/0/");

        cy.get(`a[title='${data.new_indicator.name}']`).should("not.exist");
        cy.get(`a[title='${data.new_indicator.name + " 01"}']`).should(
            "not.exist"
        );

        cy.get(".btn")
            .contains("Indicators")
            .click();
        cy.get(".modal-header").should("contain", "New Indicator");
        cy.enterIndicator(data.new_indicator.name, data.main_program);
        cy.get(".btn-close")
            .contains("Cancel")
            .click();
        cy.get(`a[title='${data.new_indicator.name}']`).should("not.exist");

        cy.get(".btn")
            .contains("Indicators")
            .click();
        cy.get(".modal-header").should("contain", "New Indicator");
        cy.enterIndicator(data.new_indicator.name, data.main_program);
        // Detecting page reload after "Save $ New"
        cy.window().then((w) => (w.beforeReload = true));
        // initially the new property in the window
        cy.window().should("have.prop", "beforeReload", true);
        cy.get("#createNewIndicatorAndNew").click();
        cy.contains("Indicator was added sucessfully").should("exist");
        // after reload the property should be gone
        cy.window().should("not.have.prop", "beforeReload");
        cy.enterIndicator(data.new_indicator.name + " 01", data.main_program);
        cy.get("#createNewIndicator").click();
        cy.contains("Indicator was added sucessfully").should("exist");

        // [TODO]: confirm the tag/class for toast messages
        // cy.get(".toast-message").should(
        //     "have.text",
        //     "Indicator was added successfully"
        // );

        cy.get("#addIndicatorModal > .modal-dialog").should("not.be.visible");

        cy.get(`a[title='${data.new_indicator.name}']`).should("exist");
        cy.get(`a[title='${data.new_indicator.name + " 01"}']`).should("exist");
    });

    it("ACTATC-2.2 Edit an Indicator", () => {
        let indicator_id;
        let indicator = data.new_indicator;
        cy.apiGetProgramIds([data.main_program]).then(() => {
            cy.get("@project_ids").then((ids) => {
                indicator.program = ids[0];
            });
        });
        cy.apiAddIndicator(indicator);

        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.visit("/indicators/home/0/0/0/");

        cy.get(`a[title='${indicator.name}']`).click();

        cy.get(".page-title").should("contain", indicator.name);

        cy.get("#id_name").type(" Edited");
        cy.contains("Cancel").click();

        cy.get(`a[title='${`${indicator.name} Edited`}']`).should("not.exist");
        cy.get(`a[title='${`${indicator.name}`}']`).should("exist");

        cy.get(`a[title='${indicator.name}']`).click();

        cy.get(".page-title").should("contain", indicator.name);

        cy.get("#id_name").type(" Edited");
        cy.get("#indicator_data")
            .find("a")
            .contains("Targets")
            .click();
        cy.get("#id_lop_target").type("150");
        cy.contains("Save").click();

        cy.get(".alert").should("contain", "Success, Indicator Updated!");
        cy.get(`a[title='${`${indicator.name} Edited`}']`).should("exist");
        cy.get(`a[title='${`${indicator.name} Edited`}']`)
            .parent("td")
            .siblings()
            .contains("150")
            .should("exist");

        cy.get(`a[title='${`${indicator.name} Edited`}']`)
            .parent("td")
            .then(($td) => {
                indicator_id = $td.attr("data-indicator-id");
                cy.get(`[href="#row-${indicator_id}"]`).click();
                cy.get("#collectedDataTable")
                    .find("td")
                    .contains("150")
                    .should("exist");
                cy.get("#results_table")
                    .find("button")
                    .contains("Add Result")
                    .should("exist");
            });
    });

    it("ACTATC-2.3 Delete an Indicator", () => {
        let indicator = data.new_indicator;
        cy.apiGetProgramIds([data.main_program]).then(() => {
            cy.get("@project_ids").then((ids) => {
                indicator.program = ids[0];
            });
        });
        cy.apiAddIndicator(indicator);

        cy.apiLogin(env.un_qa_org, env.pw_qa_org);
        cy.visit("/indicators/home/0/0/0/");
        cy.get(`a[title='${indicator.name}']`)
            .parent("td")
            .siblings(".text-right")
            .find(".dropdown-toggle")
            .click();
        cy.get(".text-danger")
            .contains("Delete")
            .click({ force: true });

        // [TODO] Verify Delete of Indicator after defect is fixed
    });
});
