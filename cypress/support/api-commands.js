///////////////////////////////////////// Custom API commands /////////////////////////////////////////

// Bypass UI login and login using CSRF Tokens
Cypress.Commands.add("apiLogin", (username, password) => {
    cy.request("/accounts/login/").then((res) => {
        const $html = Cypress.$(res.body);
        const csrfToken = $html.find("input[name=csrfmiddlewaretoken]").val();
        cy.request({
            method: "POST",
            url: "/accounts/login/",
            failOnStatusCode: false, // dont fail so we can make assertions
            form: true, // we are submitting a regular form body
            body: {
                username,
                password,
                csrfmiddlewaretoken: csrfToken, // insert this as part of form body
            },
            headers: {
                Referer: Cypress.config().baseUrl,
            },
        }).then((res) => {
            expect(res.status).to.eq(200);
            const csrfToken = res.headers["set-cookie"][0].split(";")[0];
            window.csrfToken = csrfToken.split("=")[1];
        });
    });
});

///////////////////////////////////////// Custom Django admin API commands /////////////////////////////////////////
// Logout into django Admin
Cypress.Commands.add("apiLogoutAdmin", () => {
    cy.request("/admin/logout/");
});

// Add a user using django admin
Cypress.Commands.add("apiAddUser", (username, password, email) => {
    cy.request("/admin/auth/user/").then((res) => {
        const link = Cypress.$(res.body)
            .find(`a:contains('${username}')`)
            .attr("href");
        if (!link) {
            cy.request({
                method: "POST",
                url: "/admin/auth/user/add/",
                failOnStatusCode: false,
                form: true,
                body: {
                    csrfmiddlewaretoken: window.csrfToken,
                    username: username,
                    email: email,
                    password1: password,
                    password2: password,
                },
                headers: {
                    Referer: Cypress.config().baseUrl,
                },
            }).then((res) => {
                expect(res.status).to.eq(200);
                const $html = Cypress.$(res.body);
                const success = $html.find("li[class='success']").text();
                expect(success).to.eq(
                    `The user "${username}" was added successfully. You may edit it again below.`
                );

                const userId = Cypress.$(res.body)
                    .find(`a:contains('${username}')`)
                    .attr("href")
                    .split("/")[4];

                cy.request({
                    method: "POST",
                    url: "/admin/workflow/activityuser/add/",
                    failOnStatusCode: false,
                    form: true,
                    body: {
                        csrfmiddlewaretoken: window.csrfToken,
                        user: userId,
                        _save: "Save",
                    },
                    headers: {
                        Referer: Cypress.config().baseUrl,
                    },
                }).then((res) => {
                    expect(res.status).to.eq(200);
                    const $html = Cypress.$(res.body);
                    const success = $html.find("li[class='success']").text();
                    expect(success).to.eq(
                        `The activity user "" was added successfully.`
                    );
                });
            });
        } else {
            console.log(`Username ${username} already exists.`);
        }
    });
});

// Update a user using django admin TODO: Unfinished
Cypress.Commands.add("apiUpdateUser", (fName, lName) => {
    cy.request("/admin/auth/user/").then((res) => {
        const $html = Cypress.$(res.body);
        const link = $html.find("a:contains('gfxffg')").attr("href");

        cy.request({
            method: "POST",
            url: link,
            failOnStatusCode: false,
            form: true,
            body: {
                csrfmiddlewaretoken: window.csrfToken,
                first_name: "testXXX",
                last_name: "GGXXX",
                _save: "Save",
            },
            headers: {
                Referer: Cypress.config().baseUrl,
            },
        }).then((res) => {
            expect(res.status).to.eq(200);
            cy.visit(link);
        });
    });
});

// Delete a user using django admin [TODO]: Ensure exact user is deleted
Cypress.Commands.add("apiDeleteUser", (username) => {
    cy.request("/admin/auth/user/").then((res) => {
        const link = Cypress.$(res.body)
            .find(`a:contains('${username}')`)
            .attr("href");

        if (link) {
            const id = link.split("/")[4];

            cy.request({
                method: "POST",
                url: "/admin/auth/user/",
                failOnStatusCode: false,
                form: true,
                body: {
                    csrfmiddlewaretoken: window.csrfToken,
                    _selected_action: id,
                    _selected_action: id,
                    action: "delete_selected",
                    post: "yes",
                },
                headers: {
                    Referer: Cypress.config().baseUrl,
                },
            }).then((res) => {
                expect(res.status).to.eq(200);
                const $html = Cypress.$(res.body);
                const success = $html.find("li[class='success']").text();
                expect(success).to.eq("Successfully deleted 1 user.");
            });
        } else {
            console.log(`Username ${username} does not exists.`);
        }
    });
});

/**
 * Create an Indicator
 * @param   {Object}    indicator   The object with indicator name and project id
 */
Cypress.Commands.add("apiAddIndicator", (indicator) => {
    cy.apiLogin(Cypress.env("un_qa_org"), Cypress.env("pw_qa_org")).then(() => {
        const form_body = {
            csrfmiddlewaretoken: window.csrfToken,
            name: indicator.name,
            program: indicator.program,
            "collecteddata_set-TOTAL_FORMS": 3,
            "collecteddata_set-INITIAL_FORMS": 0,
            "collecteddata_set-MIN_NUM_FORMS": 0,
            "collecteddata_set-MAX_NUM_FORMS": 1000,
            "collecteddata_set-0-targeted": 0.0,
            "collecteddata_set-1-targeted": 0.0,
            "collecteddata_set-2-targeted": 0.0,
            "collecteddata_set-__prefix__-targeted": 0.0,
        };

        cy.request({
            method: "POST",
            url: "/admin/indicators/indicator/add/",
            failOnStatusCode: false,
            form: true,
            body: form_body,
            headers: {
                Referer: Cypress.config().baseUrl,
            },
        }).then((res) => {
            const success = Cypress.$(res.body)
                .find("li[class='success']")
                .text();
            expect(success).to.eq(
                `The indicator "${indicator.name}" was added successfully.`
            );
        });
    });
    cy.apiLogoutAdmin();
});

// Delete indicator(s)
Cypress.Commands.add("apiDeleteIndicator", (indicators) => {
    cy.apiLogin(Cypress.env("un_qa_org"), Cypress.env("pw_qa_org"));
    cy.request("/admin/indicators/indicator/")
        .its("body")
        .then((body) => {
            indicators.forEach((indicator) => {
                const listItems = Cypress.$(body).find(
                    `th:contains('${indicator}')`
                );
                listItems.each((index, value) => {
                    if (value.textContent === indicator) {
                        const link = Cypress.$(value)
                            .find("a")
                            .attr("href");
                        const id = link.split("/")[4];

                        cy.request({
                            method: "POST",
                            url: "/admin/indicators/indicator/",
                            failOnStatusCode: false,
                            form: true,
                            body: {
                                csrfmiddlewaretoken: window.csrfToken,
                                _selected_action: id,
                                action: "delete_selected",
                                post: "yes",
                            },
                            headers: {
                                Referer: Cypress.config().baseUrl,
                            },
                        }).then((res) => {
                            expect(res.status).to.eq(200);
                            const $html = Cypress.$(res.body);
                            const success = $html
                                .find("li[class='success']")
                                .text();
                            expect(success).to.eq(
                                "Successfully deleted 1 indicator."
                            );
                        });
                    }
                });
            });
        });
    cy.apiLogoutAdmin();
});

Cypress.Commands.add("apiGetProgramIds", (programs) => {
    cy.apiLogin(Cypress.env("un_qa_org"), Cypress.env("pw_qa_org"));
    cy.request("/admin/workflow/program/")
        .its("body")
        .then((body) => {
            let ids = [];
            programs.forEach((program) => {
                const found_programs = Cypress.$(body).find(
                    `td:contains('${program}')`
                );
                found_programs.each((index, value) => {
                    if (value.textContent === program) {
                        const id =
                            value.previousElementSibling.previousElementSibling
                                .textContent;
                        ids.push(id);
                    }
                });
            });
            cy.wrap(ids).as("project_ids");
        });
    cy.apiLogoutAdmin();
});

/**
 * Create a Program
 * @param   {Object}    program   The object with project name, sector, start and end dates
 * Project properties
 * csrfmiddlewaretoken: ""
 *      name: ""
 *      funding_status: open
 *      cost_center:
 *      description:
 *      sector: ""
 *      start_date_0:
 *      start_date_1:
 *      end_date_0:
 *      end_date_1:
 *      organization:
 *      _save: Save
 */
Cypress.Commands.add("apiAddProgram", (program) => {
    cy.apiLogin(Cypress.env("un_qa_org"), Cypress.env("pw_qa_org")).then(() => {
        const form_body = {
            csrfmiddlewaretoken: window.csrfToken,
            name: program.name,
            funding_status: "open",
            description: program.description,
            start_date_0: program.start_date,
            end_date_0: program.end_date,
            sector: program.sector,
            organization: program.organization,
            _save: "Save",
        };

        cy.request({
            method: "POST",
            url: "/admin/workflow/program/add/",
            failOnStatusCode: false,
            form: true,
            body: form_body,
            headers: {
                Referer: Cypress.config().baseUrl,
            },
        }).then((res) => {
            const success = Cypress.$(res.body)
                .find("li[class='success']")
                .text();
            expect(success).to.eq(
                `The program "${program.name}" was added successfully.`
            );
        });
    });
    cy.apiLogoutAdmin();
});

// Delete program(s)
Cypress.Commands.add("apiDeleteProgram", (programs) => {
    cy.apiLogin(Cypress.env("un_qa_org"), Cypress.env("pw_qa_org"));
    cy.request("/admin/workflow/program/")
        .its("body")
        .then((body) => {
            programs.forEach((program) => {
                const found_projects = Cypress.$(body).find(
                    `td:contains('${program}')`
                );
                found_projects.each((index, value) => {
                    if (value.textContent === program) {
                        const id =
                            value.previousElementSibling.previousElementSibling
                                .textContent;
                        cy.request({
                            method: "POST",
                            url: "/admin/workflow/program/",
                            failOnStatusCode: false,
                            form: true,
                            body: {
                                csrfmiddlewaretoken: window.csrfToken,
                                _selected_action: id,
                                action: "delete_selected",
                                post: "yes",
                            },
                            headers: {
                                Referer: Cypress.config().baseUrl,
                            },
                        }).then((res) => {
                            expect(res.status).to.eq(200);
                            const $html = Cypress.$(res.body);
                            const success = $html
                                .find("li[class='success']")
                                .text();
                            expect(success).to.eq(
                                "Successfully deleted 1 program."
                            );
                        });
                    }
                });
            });
        });
    cy.apiLogoutAdmin();
});

/**
 * Create a Project
 * @param   {Object}    project   The object with project name and project id
 */
Cypress.Commands.add("apiAddProject", (project) => {
    cy.apiLogin(Cypress.env("un_qa_org"), Cypress.env("pw_qa_org")).then(() => {
        const form_body = {
            csrfmiddlewaretoken: window.csrfToken,
            short: "on",
            program: project.program,
            project_name: project.name,
            total_estimated_budget: 0.0,
            mc_estimated_budget: 0.0,
            local_total_estimated_budget: 0.0,
            local_mc_estimated_budget: 0.0,
            community_proposal: "(binary)",
            approval: "new",
            _save: "Save",
        };

        cy.request({
            method: "POST",
            url: "/admin/workflow/projectagreement/add/",
            failOnStatusCode: false,
            form: true,
            body: form_body,
            headers: {
                Referer: Cypress.config().baseUrl,
            },
        }).then((res) => {
            const success = Cypress.$(res.body)
                .find("li[class='success']")
                .text();
            expect(success).to.eq(
                `The project agreement "None - ${project.name}" was added successfully.`
            );
        });
    });
    cy.apiLogoutAdmin();
});

/**
 * Delete Project(s)
 * @param   {String}    program     The project's program string
 * @param   {Array}     projects    The project name string array
 */
Cypress.Commands.add("apiDeleteProject", (program, projects) => {
    const url = "/admin/workflow/projectagreement/";
    cy.apiLogin(Cypress.env("un_qa_org"), Cypress.env("pw_qa_org"));
    cy.request(url)
        .its("body")
        .then((body) => {
            projects.forEach((project) => {
                const listItems = Cypress.$(body).find(
                    `td.field-project_name:contains('${project}')`
                );

                listItems.each((index, value) => {
                    if (
                        value.textContent === project &&
                        value.previousSibling.textContent === program
                    ) {
                        const link = Cypress.$(value.previousSibling)
                            .find("a")
                            .attr("href");
                        const id = link.split("/")[4];
                        cy.request({
                            method: "POST",
                            url: url,
                            failOnStatusCode: false,
                            form: true,
                            body: {
                                csrfmiddlewaretoken: window.csrfToken,
                                _selected_action: id,
                                action: "delete_selected",
                                post: "yes",
                            },
                            headers: {
                                Referer: Cypress.config().baseUrl,
                            },
                        }).then((res) => {
                            expect(res.status).to.eq(200);
                            const $html = Cypress.$(res.body);
                            const success = $html
                                .find("li[class='success']")
                                .text();
                            expect(success).to.eq(
                                "Successfully deleted 1 project agreement."
                            );
                        });
                    }
                });
            });
        });
    cy.apiLogoutAdmin();
});
