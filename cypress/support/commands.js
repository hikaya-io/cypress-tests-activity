const { MailSlurp } = require("mailslurp-client");
const JSSoup = require("jssoup").default;

const mailslurp = new MailSlurp({
    apiKey: Cypress.env("api_key_mailslurp")
});

// Generate a random email
Cypress.Commands.add("newEmailAddress", () => {
    return mailslurp.createInbox();
});

// Fetch email by it index (0 based index)
Cypress.Commands.add("getEmail", count => {
    const email = mailslurp.waitForNthEmail(
        Cypress.env("mailslurp_inbox"),
        count,
        10000
    );
    return email;
});

// Extract notifcation link from email
Cypress.Commands.add("getLinkFromEmail", (subject, link_title, count) => {
    cy.getEmail(count).then(email => {
        expect(email.subject).to.equal(subject);
        const soup = new JSSoup(email.body);
        const links = soup.findAll("a");
        let link_found;

        links.forEach(link => {
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

// Bypass UI login and login using CSRF Tokens
Cypress.Commands.add("loginByCSRF", (username, password) => {
    cy.request("/accounts/login/").then(res => {
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
                csrfmiddlewaretoken: csrfToken // insert this as part of form body
            },
            headers: {
                Referer: Cypress.config().baseUrl
            }
        }).then(res => {
            expect(res.status).to.eq(200);
        });
    });
});

// Login into django Admin using CSRF Tokens
Cypress.Commands.add("loginAdmin", (username, password) => {
    cy.request("/admin/login/?next=/admin/").then(res => {
        const $html = Cypress.$(res.body);
        const csrfToken = $html.find("input[name=csrfmiddlewaretoken]").val();
        cy.request({
            method: "POST",
            url: "admin/login/?next=/admin/",
            failOnStatusCode: false,
            form: true,
            body: {
                username,
                password,
                csrfmiddlewaretoken: csrfToken
            },
            headers: {
                Referer: Cypress.config().baseUrl + "/admin/login/?next=/admin/"
            }
        }).then(res => {
            expect(res.status).to.eq(200);
        });
    });
});

// Logout into django Admin
Cypress.Commands.add("logoutAdmin", () => {
    cy.request("/admin/logout/");
});

// Add a user using django admin
Cypress.Commands.add("addUser", (username, password, email) => {
    cy.request("/admin/auth/user/").then(res => {
        const link = Cypress.$(res.body)
            .find(`a:contains('${username}')`)
            .attr("href");
        if (!link) {
            const csrfToken = res.headers["set-cookie"][0]
                .split(" ")[0]
                .split("=")[1]
                .split(";")[0];

            cy.request({
                method: "POST",
                url: "/admin/auth/user/add/",
                failOnStatusCode: false,
                form: true,
                body: {
                    csrfmiddlewaretoken: csrfToken,
                    username: username,
                    email: email,
                    password1: password,
                    password2: password
                },
                headers: {
                    Referer: Cypress.config().baseUrl
                }
            }).then(res => {
                expect(res.status).to.eq(200);
                const $html = Cypress.$(res.body);
                const success = $html.find("li[class='success']").text();
                expect(success).to.eq(
                    `The user "${username}" was added successfully. You may edit it again below.`
                );

                const csrfToken = res.headers["set-cookie"][0]
                    .split(" ")[0]
                    .split("=")[1]
                    .split(";")[0];
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
                        csrfmiddlewaretoken: csrfToken,
                        user: userId,
                        _save: "Save"
                    },
                    headers: {
                        Referer: Cypress.config().baseUrl
                    }
                }).then(res => {
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
Cypress.Commands.add("updateUser", (fName, lName) => {
    cy.request("/admin/auth/user/").then(res => {
        const $html = Cypress.$(res.body);
        const link = $html.find("a:contains('gfxffg')").attr("href");
        const csrfToken = res.headers["set-cookie"][0]
            .split(" ")[0]
            .split("=")[1]
            .split(";")[0];

        cy.request({
            method: "POST",
            url: link,
            failOnStatusCode: false,
            form: true,
            body: {
                csrfmiddlewaretoken: csrfToken,
                first_name: "testXXX",
                last_name: "GGXXX",
                _save: "Save"
            },
            headers: {
                Referer: Cypress.config().baseUrl
            }
        }).then(res => {
            expect(res.status).to.eq(200);
            cy.visit(link);
        });
    });
});

// Delete a user using django admin [TODO]: Ensure exact user is deleted
Cypress.Commands.add("deleteUser", username => {
    cy.request("/admin/auth/user/").then(res => {
        const link = Cypress.$(res.body)
            .find(`a:contains('${username}')`)
            .attr("href");

        if (link) {
            const id = link.split("/")[4];
            const csrfToken = res.headers["set-cookie"][0]
                .split(" ")[0]
                .split("=")[1]
                .split(";")[0];

            cy.request({
                method: "POST",
                url: "/admin/auth/user/",
                failOnStatusCode: false,
                form: true,
                body: {
                    csrfmiddlewaretoken: csrfToken,
                    _selected_action: id,
                    action: "delete_selected",
                    post: "yes"
                },
                headers: {
                    Referer: Cypress.config().baseUrl
                }
            }).then(res => {
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