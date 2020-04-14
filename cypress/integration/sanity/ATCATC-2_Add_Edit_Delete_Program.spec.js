/// <reference types="Cypress" />

context("Registration", () => {
    let data;
    let env;

    before(() => {
        cy.fixture("test_data.json").then(test_data => {
            data = test_data;
        });
        env = Cypress.env();
    });
    it("ACTATC-2.1 Adds a New Program", () => {
        const today = new Date();
        const today1 = new Date();
        //const endDate = today.setMonth(today.getDate() - 1);

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
        const startDate = `${`0${dd}`.substring(
            `0${dd}`.length - 2,
            `0${dd}`.length
        )}.${`0${mm}`.substring(
            `0${mm}`.length - 2,
            `0${mm}`.length
        )}.${yyyyE}`;
        const endDate = `${`0${ddE}`.substring(
            `0${ddE}`.length - 2,
            `0${ddE}`.length
        )}.${`0${mmE}`.substring(
            `0${mmE}`.length - 2,
            `0${mmE}`.length
        )}.${yyyyE}`;

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

        cy.get("[data-target='#addProgramModal'").click();
        cy.get("#addProgramModal").should("be.visible");
        cy.get("#addProgramModal").toMatchImageSnapshot();
        cy.get("#addProgramModalLabel").should("contain", "Add Programs");

        cy.get("#programName")
            .invoke("val", data.new_program)
            .should("have.value", data.new_program);
        cy.get("[placeholder='Select sectors...']").click();
        cy.get(".select2-results__option")
            .contains(data.sector_DRR)
            .click("center", { force: true });
        cy.get(`li[title="${data.sector_DRR}"]`).should("exist");

        cy.get("#startDate").type(startDate);
        cy.get("#endDate").type(endDate);

        cy.get("a[title='Prev']").click();
        // cy.get("a[title='Prev']").should("have.class", "ui-state-disabled");

        cy.get("#startDate").click();
        cy.get("a[title='Next']").click();
        cy.get("a[title='Next']").should("have.class", "ui-state-disabled");
    });
});
