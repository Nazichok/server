import request from "supertest";
let expect: any = null;
import("chai").then((module) => {
  expect = module.expect;
});

import app from "../../server";

import User from "../../models/User";
import { user } from "../mock";

const tempUser = user;

let tempToken;

before(function (done) {
  this.timeout(3000);
  setTimeout(done, 2000);
});

describe("POST users", () => {
  it("should register new user with valid credentials", (done) => {
    request(app)
      .post("/api/auth/signup")
      .send(tempUser)
      .expect(200)
      .then((res) => {
        expect(res.body.message).to.be.eql(
          "Registration Successful! Check your email"
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("shouldn't accept the username that already exists in the database", (done) => {
    request(app)
      .post("/api/auth/signup")
      .send(tempUser)
      .expect(409)
      .then((res) => {
        expect(res.body.message).to.be.eql(
          "Failed! Username is already in use!"
        );
        done();
      })
      .catch((err) => done(err));
  });
});

after(async () => {
  try {
    await User.deleteOne({ username: user.username });
  } catch (err) {
    console.error(err);
  }
});