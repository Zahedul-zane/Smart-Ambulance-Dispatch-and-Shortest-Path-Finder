#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <algorithm>
#include <climits>
#include <iomanip>

using namespace std;

// ==========================================
// 1. ARRAY: Traversal, Insertion, Deletion
// ==========================================
class AmbulanceFleetArray {
public:
    int fleet[20];
    int size = 0;

    void insert(int ambulanceId) {
        if (size < 20) {
            fleet[size++] = ambulanceId;
            cout << "[Array] Ambulance " << ambulanceId << " inserted. Fleet size: " << size << "\n";
        }
    }

    void remove(int ambulanceId) {
        int idx = -1;
        for (int i = 0; i < size; i++) {
            if (fleet[i] == ambulanceId) { idx = i; break; }
        }
        if (idx != -1) {
            for (int i = idx; i < size - 1; i++) fleet[i] = fleet[i + 1];
            size--;
            cout << "[Array] Ambulance " << ambulanceId << " removed. Fleet size: " << size << "\n";
        }
    }

    void traverse() {
        cout << "[Array Traversal] Fleet IDs: ";
        for (int i = 0; i < size; i++) cout << fleet[i] << " ";
        cout << "\n";
    }
};

// ==========================================
// 2. MATRIX: Addition, Subtraction, Multiplication
// ==========================================
class TrafficMatrixOps {
public:
    static const int N = 3;

    void add(int A[N][N], int B[N][N], int Res[N][N]) {
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++)
                Res[i][j] = A[i][j] + B[i][j];
    }

    void subtract(int A[N][N], int B[N][N], int Res[N][N]) {
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++)
                Res[i][j] = A[i][j] - B[i][j];
    }

    void multiply(int A[N][N], int B[N][N], int Res[N][N]) {
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                Res[i][j] = 0;
                for (int k = 0; k < N; k++)
                    Res[i][j] += A[i][k] * B[k][j];
            }
        }
    }
};

// ==========================================
// 3. SEARCHING: Linear Search & Binary Search
// ==========================================
class SearchModule {
public:
    static int linearSearch(const vector<string>& hospitals, const string& target) {
        for (size_t i = 0; i < hospitals.size(); i++) {
            if (hospitals[i] == target) return (int)i;
        }
        return -1;
    }

    static int binarySearch(const vector<int>& sortedTokens, int key) {
        int low = 0, high = (int)sortedTokens.size() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (sortedTokens[mid] == key) return mid;
            if (sortedTokens[mid] < key) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
};

// ==========================================
// 4. LINKED LIST: Creation, Insertion, Deletion
// ==========================================
struct DispatchNode {
    int callId;
    string hospitalName;
    DispatchNode* next;
    DispatchNode(int id, string h) : callId(id), hospitalName(h), next(nullptr) {}
};

class DispatchLinkedList {
private:
    DispatchNode* head;
public:
    DispatchLinkedList() : head(nullptr) {}

    void insert(int callId, string hospital) {
        DispatchNode* newNode = new DispatchNode(callId, hospital);
        if (!head) { head = newNode; return; }
        DispatchNode* temp = head;
        while (temp->next) temp = temp->next;
        temp->next = newNode;
    }

    void remove(int callId) {
        if (!head) return;
        if (head->callId == callId) {
            DispatchNode* toDelete = head;
            head = head->next;
            delete toDelete;
            return;
        }
        DispatchNode* curr = head;
        while (curr->next && curr->next->callId != callId) curr = curr->next;
        if (curr->next) {
            DispatchNode* toDelete = curr->next;
            curr->next = curr->next->next;
            delete toDelete;
        }
    }

    void display() {
        DispatchNode* temp = head;
        cout << "[Linked List Active Dispatches]: ";
        while (temp) {
            cout << "[#" << temp->callId << " -> " << temp->hospitalName << "] -> ";
            temp = temp->next;
        }
        cout << "NULL\n";
    }
};

// ==========================================
// 5. SORTING: Bubble, Selection, Insertion Sort
// ==========================================
class IncidentSorter {
public:
    static void bubbleSort(vector<int>& arr) {
        int n = arr.size();
        for (int i = 0; i < n - 1; i++)
            for (int j = 0; j < n - i - 1; j++)
                if (arr[j] > arr[j + 1]) swap(arr[j], arr[j + 1]);
    }

    static void selectionSort(vector<int>& arr) {
        int n = arr.size();
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++)
                if (arr[j] < arr[minIdx]) minIdx = j;
            swap(arr[i], arr[minIdx]);
        }
    }

    static void insertionSort(vector<int>& arr) {
        int n = arr.size();
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }
};

// ==========================================
// 6. STACK & QUEUE & CIRCULAR QUEUE
// ==========================================
class DispatchStack {
    vector<int> st;
public:
    void push(int incidentId) { st.push_back(incidentId); }
    int pop() {
        if (st.empty()) return -1;
        int val = st.back(); st.pop_back();
        return val;
    }
    bool empty() { return st.empty(); }
};

class CircularQueue {
    int arr[5];
    int front = -1, rear = -1;
    int capacity = 5;
public:
    bool enqueue(int val) {
        if ((front == 0 && rear == capacity - 1) || (rear == (front - 1) % (capacity - 1))) {
            return false; // Full
        }
        if (front == -1) { front = rear = 0; }
        else if (rear == capacity - 1 && front != 0) { rear = 0; }
        else { rear++; }
        arr[rear] = val;
        return true;
    }

    int dequeue() {
        if (front == -1) return -1; // Empty
        int data = arr[front];
        if (front == rear) { front = rear = -1; }
        else if (front == capacity - 1) { front = 0; }
        else { front++; }
        return data;
    }
};

// ==========================================
// 7. RECURSION: Tower of Hanoi
// ==========================================
void solveHanoi(int n, char from_rod, char to_rod, char aux_rod) {
    if (n == 0) return;
    solveHanoi(n - 1, from_rod, aux_rod, to_rod);
    cout << "Move triage tier " << n << " from " << from_rod << " to " << to_rod << "\n";
    solveHanoi(n - 1, aux_rod, to_rod, from_rod);
}

// ==========================================
// 8. GRAPH & DIJKSTRA: Shortest Path Finder
// ==========================================
struct Edge {
    int to;
    double weight;
};

class BangladeshRoadNetwork {
public:
    int V;
    vector<vector<Edge>> adjList;
    vector<string> nodeNames;

    BangladeshRoadNetwork(int vertices) : V(vertices), adjList(vertices) {}

    void setNodeNames(const vector<string>& names) { nodeNames = names; }

    void addEdge(int u, int v, double weight) {
        adjList[u].push_back({v, weight});
        adjList[v].push_back({u, weight});
    }

    void findShortestPath(int src, int dest) {
        vector<double> dist(V, 1e9);
        vector<int> parent(V, -1);
        priority_queue<pair<double, int>, vector<pair<double, int>>, greater<pair<double, int>>> pq;

        dist[src] = 0;
        pq.push({0.0, src});

        while (!pq.empty()) {
            double d = pq.top().first;
            int u = pq.top().second;
            pq.pop();

            if (d > dist[u]) continue;
            if (u == dest) break;

            for (const auto& edge : adjList[u]) {
                if (dist[u] + edge.weight < dist[edge.to]) {
                    dist[edge.to] = dist[u] + edge.weight;
                    parent[edge.to] = u;
                    pq.push({dist[edge.to], edge.to});
                }
            }
        }

        cout << "\n=== Shortest Route from " << nodeNames[src] << " to " << nodeNames[dest] << " ===\n";
        cout << "Estimated Distance/Time Score: " << dist[dest] << " units\nRoute: ";
        vector<int> path;
        for (int v = dest; v != -1; v = parent[v]) path.push_back(v);
        reverse(path.begin(), path.end());

        for (size_t i = 0; i < path.size(); i++) {
            cout << nodeNames[path[i]] << (i + 1 < path.size() ? " -> " : "\n");
        }
    }
};

int main() {
    cout << "========================================================\n";
    cout << " SMART AMBULANCE DISPATCH & SHORTEST PATH FINDER (BD)  \n";
    cout << "========================================================\n\n";

    // Initialize Network with 10 Bangladesh Locations
    vector<string> bdNodes = {
        "Dhaka Medical (DMCH)", "BSMMU Shahbagh", "Farmgate Junction", 
        "Mohakhali Junction", "Kurmitola General Hospital", "Airport Junction", 
        "Evercare Hospital", "Square Hospital", "Jatrabari Junction", "Chittagong Medical (CMCH)"
    };

    BangladeshRoadNetwork bd(10);
    bd.setNodeNames(bdNodes);

    bd.addEdge(0, 1, 2.1); // DMCH - BSMMU
    bd.addEdge(1, 2, 3.4); // BSMMU - Farmgate
    bd.addEdge(2, 7, 1.2); // Farmgate - Square
    bd.addEdge(2, 3, 2.8); // Farmgate - Mohakhali
    bd.addEdge(3, 4, 4.5); // Mohakhali - Kurmitola
    bd.addEdge(4, 5, 3.0); // Kurmitola - Airport
    bd.addEdge(5, 6, 4.0); // Airport - Evercare
    bd.addEdge(0, 8, 4.8); // DMCH - Jatrabari
    bd.addEdge(8, 9, 240.0); // Jatrabari - Chittagong

    // Find Shortest Path from DMCH (0) to Evercare (6)
    bd.findShortestPath(0, 6);

    return 0;
}