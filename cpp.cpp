#include <httplib.h>
#include <nlohmann/json.hpp>
#include <mysql/cppconn/driver.h>
#include <mysql/cppconn/connection.h>
#include <mysql/cppconn/statement.h>
#include <mysql/cppconn/prepared_statement.h>
#include <fstream>
#include <iomanip>
#include <sstream>

using json = nlohmann::json;
using namespace sql;
using namespace sql::mysql;

class Database {
private:
    Driver* driver;
    Connection* con;
public:
    Database() {
        driver = get_driver_instance();
        con = driver->connect("tcp://127.0.0.1:3306", "root", "password");
        con->setSchema("dcsol_events");
    }
    
    ~Database() { delete con; }
    
    json getEvents() {
        Statement* stmt = con->createStatement();
        ResultSet* res = stmt->executeQuery("SELECT * FROM events ORDER BY date ASC");
        json events = json::array();
        while (res->next()) {
            events.push_back({
                {"id", res->getInt("id")},
                {"name", res->getString("name")},
                {"date", res->getString("date")},
                {"location", res->getString("location")},
                {"description", res->getString("description")},
                {"map_link", res->getString("map_link")}
            });
        }
        delete res;
        delete stmt;
        return events;
    }
    
    // Add other CRUD methods: createEvent, registerEvent, login, etc.
};

int main() {
    Database db;
    httplib::Server svr;
    
    svr.Get("/api/events", [&](const httplib::Request&, httplib::Response& res) {
        json events = db.getEvents();
        res.set_content(events.dump(), "application/json");
    });
    
    svr.Post("/api/login", [&](const httplib::Request& req, httplib::Response& res) {
        // Parse JSON, validate user, return user data
        json response = {{"id", 1}, {"success", true}};
        res.set_content(response.dump(), "application/json");
    });
    
    svr.listen("0.0.0.0", 8080);
    return 0;
}
