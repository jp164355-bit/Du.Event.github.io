#include <iostream>
#include <string>
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/statement.h>
#include <cppconn/resultset.h>
#include <openssl/sha.h>

using namespace std;
using namespace sql;
using namespace sql::mysql;

class DUSOLAuth {
private:
    Connection *con;
    
public:
    DUSOLAuth() {
        Driver *driver = get_driver_instance();
        con = driver->connect("tcp://127.0.0.1:3306", "root", "password");
        con->setSchema("dusol_events");
    }
    
    string authenticate(string collegeId, string password) {
        Statement *stmt = con->createStatement();
        string query = "SELECT id, password_hash, role FROM users WHERE college_id = '" + collegeId + "'";
        ResultSet *res = stmt->executeQuery(query);
        
        if (res->next()) {
            string storedHash = res->getString("password_hash");
            string inputHash = sha256(password);
            
            if (storedHash == inputHash) {
                return res->getString("role");
            }
        }
        return "INVALID";
    }
    
private:
    string sha256(string input) {
        unsigned char hash[SHA256_DIGEST_LENGTH];
        SHA256_CTX sha256;
        SHA256_Init(&sha256);
        SHA256_Update(&sha256, input.c_str(), input.length());
        SHA256_Final(hash, &sha256);
        
        stringstream ss;
        for(int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
            ss << hex << setw(2) << setfill('0') << (int)hash[i];
        }
        return ss.str();
    }
};

int main() {
    DUSOLAuth auth;
    cout << "DU SOL C++ Auth Service Running..." << endl;
    
    string collegeId, password;
    while (true) {
        cout << "College ID: ";
        cin >> collegeId;
        cout << "Password: ";
        cin >> password;
        
        string result = auth.authenticate(collegeId, password);
        cout << "Role: " << result << endl;
    }
    return 0;
}
