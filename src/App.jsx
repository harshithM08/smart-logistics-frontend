import { useEffect, useState } from "react";

import "./App.css";



const API = "https://smart-logistics-backend-production.up.railway.app/api";



function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("smartlogix_authenticated") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("smartlogix_authenticated");
    setIsAuthenticated(false);
  };


  const [activePage, setActivePage] = useState("dashboard");



  const [orders, setOrders] = useState([]);

  const [warehouses, setWarehouses] = useState([]);

  const [vehicles, setVehicles] = useState([]);

  const [drivers, setDrivers] = useState([]);

  const [routes, setRoutes] = useState([]);

  const [deliveries, setDeliveries] = useState([]);



  const [orderForm, setOrderForm] = useState({

    orderNumber: "",

    customerName: "",

    pickupLocation: "",

    deliveryLocation: "",

    status: "Pending",

  });



  const [warehouseForm, setWarehouseForm] = useState({

    name: "",

    location: "",

    capacity: "",

  });



  const [vehicleForm, setVehicleForm] = useState({

    vehicleNumber: "",

    vehicleType: "",

    capacity: "",

    status: "Available",

  });



  const [driverForm, setDriverForm] = useState({

    name: "",

    phone: "",

    licenseNumber: "",

    status: "Available",

  });



  const [routeForm, setRouteForm] = useState({

    source: "",

    destination: "",

    distance: "",

    estimatedTime: "",

  });



  const [deliveryForm, setDeliveryForm] = useState({

    orderId: "",

    vehicleId: "",

    driverId: "",

    routeId: "",

    deliveryDate: "",

    status: "Pending",

  });



  const pageInfo = {

    dashboard: {

      title: "Dashboard",

      subtitle: "Overview of your logistics operations",

    },

    orders: {

      title: "Orders",

      subtitle: "Create and manage customer orders",

    },

    warehouses: {

      title: "Warehouses",

      subtitle: "Manage warehouse locations and capacity",

    },

    vehicles: {

      title: "Vehicles",

      subtitle: "Track your logistics vehicle fleet",

    },

    drivers: {

      title: "Drivers",

      subtitle: "Manage drivers and availability",

    },

    routes: {

      title: "Routes",

      subtitle: "Manage transportation routes",

    },

    deliveries: {

      title: "Deliveries",

      subtitle: "Track and manage delivery assignments",

    },

  };



  const navigation = [

    { id: "dashboard", icon: "⌂", label: "Dashboard" },

    { id: "orders", icon: "▣", label: "Orders" },

    { id: "warehouses", icon: "▤", label: "Warehouses" },

    { id: "vehicles", icon: "▰", label: "Vehicles" },

    { id: "drivers", icon: "♙", label: "Drivers" },

    { id: "routes", icon: "⇄", label: "Routes" },

    { id: "deliveries", icon: "◈", label: "Deliveries" },

  ];



  // =========================*

  // LOAD DATA*

  // =========================*



  const fetchAllData = async () => {

    try {

      const [

        ordersResponse,

        warehousesResponse,

        vehiclesResponse,

        driversResponse,

        routesResponse,

        deliveriesResponse,

      ] = await Promise.all([

        fetch(`${API}/orders`),

        fetch(`${API}/warehouses`),

        fetch(`${API}/vehicles`),

        fetch(`${API}/drivers`),

        fetch(`${API}/routes`),

        fetch(`${API}/deliveries`),

      ]);



      if (

        !ordersResponse.ok ||

        !warehousesResponse.ok ||

        !vehiclesResponse.ok ||

        !driversResponse.ok ||

        !routesResponse.ok ||

        !deliveriesResponse.ok

      ) {

        throw new Error("Could not load application data.");

      }



      setOrders(await ordersResponse.json());

      setWarehouses(await warehousesResponse.json());

      setVehicles(await vehiclesResponse.json());

      setDrivers(await driversResponse.json());

      setRoutes(await routesResponse.json());

      setDeliveries(await deliveriesResponse.json());

    } catch (error) {

      console.error("Error loading data:", error);

    }

  };



  useEffect(() => {

    if (isAuthenticated) {
      fetchAllData();
    }

  }, [isAuthenticated]);



  // =========================*

  // ADD*

  // =========================*



  const addItem = async (endpoint, data, resetForm) => {

    try {

      const response = await fetch(`${API}/${endpoint}`, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify(data),

      });



      if (!response.ok) {

        let message = "Could not add the record.";



        try {

          const errorData = await response.json();



          if (errorData.message) {

            message = errorData.message;

          }

        } catch {

          // Default message*

        }



        throw new Error(message);

      }



      resetForm();

      await fetchAllData();

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  };



  // =========================*

  // DELETE*

  // =========================*



  const deleteItem = async (endpoint, id) => {

    if (!window.confirm("Are you sure you want to delete this record?")) {

      return;

    }



    try {

      const response = await fetch(`${API}/${endpoint}/${id}`, {

        method: "DELETE",

      });



      if (!response.ok) {

        let message = "Could not delete the record.";



        try {

          const errorData = await response.json();



          if (errorData.message) {

            message = errorData.message;

          }

        } catch {

          // Default message*

        }



        throw new Error(message);

      }



      await fetchAllData();

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  };



  // =========================*

  // UPDATE DELIVERY STATUS*

  // =========================*



  const updateDeliveryStatus = async (delivery, newStatus) => {

    try {

      const updatedDelivery = {

        orderId: delivery.orderId,

        vehicleId: delivery.vehicleId,

        driverId: delivery.driverId,

        routeId: delivery.routeId,

        deliveryDate: delivery.deliveryDate,

        status: newStatus,

      };



      const response = await fetch(

        `${API}/deliveries/${delivery.id}`,

        {

          method: "PUT",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify(updatedDelivery),

        }

      );



      if (!response.ok) {

        let message = "Could not update delivery status.";



        try {

          const errorData = await response.json();



          if (errorData.message) {

            message = errorData.message;

          }

        } catch {

          // Default message*

        }



        throw new Error(message);

      }



      await fetchAllData();

    } catch (error) {

      console.error(error);

      alert(error.message);

      await fetchAllData();

    }

  };



  // =========================*

  // COUNTS*

  // =========================*



  const totalOrders = orders.length;



  const pendingOrders = orders.filter(

    (order) => order.status?.toLowerCase() === "pending"

  ).length;



  const inTransitOrders = orders.filter(

    (order) => order.status?.toLowerCase() === "in transit"

  ).length;



  const deliveredOrders = orders.filter(

    (order) => order.status?.toLowerCase() === "delivered"

  ).length;



  const totalDeliveries = deliveries.length;



  const pendingDeliveries = deliveries.filter(

    (delivery) => delivery.status?.toLowerCase() === "pending"

  ).length;



  const inTransitDeliveries = deliveries.filter(

    (delivery) => delivery.status?.toLowerCase() === "in transit"

  ).length;



  const deliveredDeliveries = deliveries.filter(

    (delivery) => delivery.status?.toLowerCase() === "delivered"

  ).length;



  const availableVehicles = vehicles.filter(

    (vehicle) => vehicle.status?.toLowerCase() === "available"

  ).length;



  const vehiclesInUse = vehicles.filter(

    (vehicle) => vehicle.status?.toLowerCase() === "in use"

  ).length;



  const availableDrivers = drivers.filter(

    (driver) => driver.status?.toLowerCase() === "available"

  ).length;



  const assignedDrivers = drivers.filter(

    (driver) => driver.status?.toLowerCase() === "assigned"

  ).length;



  const availableVehicleList = vehicles.filter(

    (vehicle) => vehicle.status?.toLowerCase() === "available"

  );



  const availableDriverList = drivers.filter(

    (driver) => driver.status?.toLowerCase() === "available"

  );



  // =========================*

  // FORMS*

  // =========================*



  const handleOrderSubmit = (event) => {

    event.preventDefault();



    addItem("orders", orderForm, () => {

      setOrderForm({

        orderNumber: "",

        customerName: "",

        pickupLocation: "",

        deliveryLocation: "",

        status: "Pending",

      });

    });

  };



  const handleWarehouseSubmit = (event) => {

    event.preventDefault();



    addItem(

      "warehouses",

      {

        ...warehouseForm,

        capacity: Number(warehouseForm.capacity),

      },

      () => {

        setWarehouseForm({

          name: "",

          location: "",

          capacity: "",

        });

      }

    );

  };



  const handleVehicleSubmit = (event) => {

    event.preventDefault();



    addItem(

      "vehicles",

      {

        ...vehicleForm,

        capacity: Number(vehicleForm.capacity),

      },

      () => {

        setVehicleForm({

          vehicleNumber: "",

          vehicleType: "",

          capacity: "",

          status: "Available",

        });

      }

    );

  };



  const handleDriverSubmit = (event) => {

    event.preventDefault();



    addItem("drivers", driverForm, () => {

      setDriverForm({

        name: "",

        phone: "",

        licenseNumber: "",

        status: "Available",

      });

    });

  };



  const handleRouteSubmit = (event) => {

    event.preventDefault();



    addItem(

      "routes",

      {

        ...routeForm,

        distance: Number(routeForm.distance),

      },

      () => {

        setRouteForm({

          source: "",

          destination: "",

          distance: "",

          estimatedTime: "",

        });

      }

    );

  };



  const handleDeliverySubmit = (event) => {

    event.preventDefault();



    addItem(

      "deliveries",

      {

        ...deliveryForm,

        orderId: Number(deliveryForm.orderId),

        vehicleId: Number(deliveryForm.vehicleId),

        driverId: Number(deliveryForm.driverId),

        routeId: Number(deliveryForm.routeId),

      },

      () => {

        setDeliveryForm({

          orderId: "",

          vehicleId: "",

          driverId: "",

          routeId: "",

          deliveryDate: "",

          status: "Pending",

        });

      }

    );

  };



  // =========================*

  // STATUS BADGE*

  // =========================*



  const StatusBadge = ({ status }) => {

    const normalized = status?.toLowerCase().replace(" ", "-");



    return (

      <span className={`status-badge ${normalized}`}>

        {status}

      </span>

    );

  };



  // =========================*

  // DASHBOARD*

  // =========================*



  const renderDashboard = () => (

    <div className="dashboard-content">



      <div className="welcome-panel">

        <div>

          <span className="eyebrow">LOGISTICS OVERVIEW</span>



          <h2>Operations Dashboard</h2>



          <p>

            Monitor orders, deliveries, vehicles and drivers

            from one centralized workspace.

          </p>

        </div>



        <div className="welcome-icon">

          ◈

        </div>

      </div>



      <div className="section-heading">

        <div>

          <h3>Order Overview</h3>

          <p>Current order status across the system</p>

        </div>

      </div>



      <div className="stats-grid">



        <div className="dashboard-stat">

          <div className="stat-icon blue">▣</div>



          <div>

            <span>Total Orders</span>

            <strong>{totalOrders}</strong>

          </div>

        </div>



        <div className="dashboard-stat">

          <div className="stat-icon orange">◷</div>



          <div>

            <span>Pending Orders</span>

            <strong>{pendingOrders}</strong>

          </div>

        </div>



        <div className="dashboard-stat">

          <div className="stat-icon purple">⇢</div>



          <div>

            <span>In Transit</span>

            <strong>{inTransitOrders}</strong>

          </div>

        </div>



        <div className="dashboard-stat">

          <div className="stat-icon green">✓</div>



          <div>

            <span>Delivered</span>

            <strong>{deliveredOrders}</strong>

          </div>

        </div>



      </div>



      <div className="dashboard-columns">



        <div className="dashboard-panel">



          <div className="panel-heading">

            <div>

              <h3>Delivery Activity</h3>

              <p>Current delivery pipeline</p>

            </div>



            <button

              className="text-button"

              onClick={() => setActivePage("deliveries")}

            >

              View Deliveries →

            </button>

          </div>



          <div className="activity-list">



            <div className="activity-row">

              <span className="activity-dot orange"></span>



              <div>

                <strong>Pending</strong>

                <span>Deliveries awaiting dispatch</span>

              </div>



              <b>{pendingDeliveries}</b>

            </div>



            <div className="activity-row">

              <span className="activity-dot purple"></span>



              <div>

                <strong>In Transit</strong>

                <span>Deliveries currently active</span>

              </div>



              <b>{inTransitDeliveries}</b>

            </div>



            <div className="activity-row">

              <span className="activity-dot green"></span>



              <div>

                <strong>Completed</strong>

                <span>Successfully delivered orders</span>

              </div>



              <b>{deliveredDeliveries}</b>

            </div>



          </div>



        </div>



        <div className="dashboard-panel">



          <div className="panel-heading">

            <div>

              <h3>Resource Availability</h3>

              <p>Current fleet and driver status</p>

            </div>

          </div>



          <div className="resource-grid">



            <div className="resource-card">

              <span>Vehicles</span>

              <strong>{availableVehicles}</strong>

              <small>Available</small>

            </div>



            <div className="resource-card">

              <span>Vehicles</span>

              <strong>{vehiclesInUse}</strong>

              <small>In use</small>

            </div>



            <div className="resource-card">

              <span>Drivers</span>

              <strong>{availableDrivers}</strong>

              <small>Available</small>

            </div>



            <div className="resource-card">

              <span>Drivers</span>

              <strong>{assignedDrivers}</strong>

              <small>Assigned</small>

            </div>



          </div>



        </div>



      </div>



      <div className="quick-section">



        <div className="section-heading">

          <div>

            <h3>System Summary</h3>

            <p>Registered logistics resources</p>

          </div>

        </div>



        <div className="summary-grid">



          <div className="summary-card">

            <span>Warehouses</span>

            <strong>{warehouses.length}</strong>

            <button onClick={() => setActivePage("warehouses")}>

              Manage →

            </button>

          </div>



          <div className="summary-card">

            <span>Vehicles</span>

            <strong>{vehicles.length}</strong>

            <button onClick={() => setActivePage("vehicles")}>

              Manage →

            </button>

          </div>



          <div className="summary-card">

            <span>Drivers</span>

            <strong>{drivers.length}</strong>

            <button onClick={() => setActivePage("drivers")}>

              Manage →

            </button>

          </div>



          <div className="summary-card">

            <span>Routes</span>

            <strong>{routes.length}</strong>

            <button onClick={() => setActivePage("routes")}>

              Manage →

            </button>

          </div>



          <div className="summary-card">

            <span>Deliveries</span>

            <strong>{totalDeliveries}</strong>

            <button onClick={() => setActivePage("deliveries")}>

              Manage →

            </button>

          </div>



        </div>



      </div>



    </div>

  );



  // =========================*

  // ORDERS*

  // =========================*



  const renderOrders = () => (

    <section className="management-section">



      <div className="page-section-header">

        <div>

          <span className="eyebrow">MANAGEMENT</span>

          <h2>Orders</h2>

          <p>Create and manage customer orders.</p>

        </div>



        <div className="record-count">

          {orders.length} Records

        </div>

      </div>



      <form

        className="management-form"

        onSubmit={handleOrderSubmit}

      >



        <div className="form-field">

          <label>Order Number</label>



          <input

            placeholder="e.g. ORD003"

            value={orderForm.orderNumber}

            onChange={(e) =>

              setOrderForm({

                ...orderForm,

                orderNumber: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Customer Name</label>



          <input

            placeholder="Customer name"

            value={orderForm.customerName}

            onChange={(e) =>

              setOrderForm({

                ...orderForm,

                customerName: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Pickup Location</label>



          <input

            placeholder="Pickup location"

            value={orderForm.pickupLocation}

            onChange={(e) =>

              setOrderForm({

                ...orderForm,

                pickupLocation: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Delivery Location</label>



          <input

            placeholder="Delivery location"

            value={orderForm.deliveryLocation}

            onChange={(e) =>

              setOrderForm({

                ...orderForm,

                deliveryLocation: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Status</label>



          <select

            value={orderForm.status}

            onChange={(e) =>

              setOrderForm({

                ...orderForm,

                status: e.target.value,

              })

            }

          >

            <option>Pending</option>

            <option>In Transit</option>

            <option>Delivered</option>

          </select>

        </div>



        <div className="form-action">

          <button type="submit">

            + Add Order

          </button>

        </div>



      </form>



      <Table>



        <thead>

          <tr>

            <th>ID</th>

            <th>Order</th>

            <th>Customer</th>

            <th>Pickup</th>

            <th>Delivery</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>



        <tbody>



          {orders.map((order) => (

            <tr key={order.id}>



              <td className="id-cell">

                #{order.id}

              </td>



              <td className="strong-cell">

                {order.orderNumber}

              </td>



              <td>{order.customerName}</td>

              <td>{order.pickupLocation}</td>

              <td>{order.deliveryLocation}</td>



              <td>

                <StatusBadge status={order.status} />

              </td>



              <td>

                <button

                  className="delete-button"

                  onClick={() =>

                    deleteItem("orders", order.id)

                  }

                >

                  Delete

                </button>

              </td>



            </tr>

          ))}



        </tbody>



      </Table>



    </section>

  );



  // =========================*

  // WAREHOUSES*

  // =========================*



  const renderWarehouses = () => (

    <section className="management-section">



      <div className="page-section-header">

        <div>

          <span className="eyebrow">MANAGEMENT</span>

          <h2>Warehouses</h2>

          <p>Manage warehouse locations and storage capacity.</p>

        </div>



        <div className="record-count">

          {warehouses.length} Records

        </div>

      </div>



      <form

        className="management-form"

        onSubmit={handleWarehouseSubmit}

      >



        <div className="form-field">

          <label>Warehouse Name</label>



          <input

            placeholder="Warehouse name"

            value={warehouseForm.name}

            onChange={(e) =>

              setWarehouseForm({

                ...warehouseForm,

                name: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Location</label>



          <input

            placeholder="City / location"

            value={warehouseForm.location}

            onChange={(e) =>

              setWarehouseForm({

                ...warehouseForm,

                location: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Capacity</label>



          <input

            type="number"

            placeholder="Capacity"

            value={warehouseForm.capacity}

            onChange={(e) =>

              setWarehouseForm({

                ...warehouseForm,

                capacity: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-action">

          <button type="submit">

            + Add Warehouse

          </button>

        </div>



      </form>



      <Table>



        <thead>

          <tr>

            <th>ID</th>

            <th>Name</th>

            <th>Location</th>

            <th>Capacity</th>

            <th>Action</th>

          </tr>

        </thead>



        <tbody>



          {warehouses.map((warehouse) => (

            <tr key={warehouse.id}>



              <td className="id-cell">

                #{warehouse.id}

              </td>



              <td className="strong-cell">

                {warehouse.name}

              </td>



              <td>{warehouse.location}</td>

              <td>{warehouse.capacity}</td>



              <td>

                <button

                  className="delete-button"

                  onClick={() =>

                    deleteItem(

                      "warehouses",

                      warehouse.id

                    )

                  }

                >

                  Delete

                </button>

              </td>



            </tr>

          ))}



        </tbody>



      </Table>



    </section>

  );



  // =========================*

  // VEHICLES*

  // =========================*



  const renderVehicles = () => (

    <section className="management-section">



      <div className="page-section-header">

        <div>

          <span className="eyebrow">FLEET</span>

          <h2>Vehicles</h2>

          <p>Track vehicles and their current availability.</p>

        </div>



        <div className="record-count">

          {vehicles.length} Records

        </div>

      </div>



      <form

        className="management-form"

        onSubmit={handleVehicleSubmit}

      >



        <div className="form-field">

          <label>Vehicle Number</label>



          <input

            placeholder="Vehicle registration"

            value={vehicleForm.vehicleNumber}

            onChange={(e) =>

              setVehicleForm({

                ...vehicleForm,

                vehicleNumber: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Vehicle Type</label>



          <input

            placeholder="Truck / Van / etc."

            value={vehicleForm.vehicleType}

            onChange={(e) =>

              setVehicleForm({

                ...vehicleForm,

                vehicleType: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Capacity</label>



          <input

            type="number"

            placeholder="Capacity"

            value={vehicleForm.capacity}

            onChange={(e) =>

              setVehicleForm({

                ...vehicleForm,

                capacity: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Status</label>



          <select

            value={vehicleForm.status}

            onChange={(e) =>

              setVehicleForm({

                ...vehicleForm,

                status: e.target.value,

              })

            }

          >

            <option>Available</option>

            <option>In Use</option>

            <option>Maintenance</option>

          </select>

        </div>



        <div className="form-action">

          <button type="submit">

            + Add Vehicle

          </button>

        </div>



      </form>



      <Table>



        <thead>

          <tr>

            <th>ID</th>

            <th>Vehicle Number</th>

            <th>Type</th>

            <th>Capacity</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>



        <tbody>



          {vehicles.map((vehicle) => (

            <tr key={vehicle.id}>



              <td className="id-cell">

                #{vehicle.id}

              </td>



              <td className="strong-cell">

                {vehicle.vehicleNumber}

              </td>



              <td>{vehicle.vehicleType}</td>

              <td>{vehicle.capacity}</td>



              <td>

                <StatusBadge status={vehicle.status} />

              </td>



              <td>

                <button

                  className="delete-button"

                  onClick={() =>

                    deleteItem(

                      "vehicles",

                      vehicle.id

                    )

                  }

                >

                  Delete

                </button>

              </td>



            </tr>

          ))}



        </tbody>



      </Table>



    </section>

  );



  // =========================*

  // DRIVERS*

  // =========================*



  const renderDrivers = () => (

    <section className="management-section">



      <div className="page-section-header">

        <div>

          <span className="eyebrow">PERSONNEL</span>

          <h2>Drivers</h2>

          <p>Manage drivers, licenses and availability.</p>

        </div>



        <div className="record-count">

          {drivers.length} Records

        </div>

      </div>



      <form

        className="management-form"

        onSubmit={handleDriverSubmit}

      >



        <div className="form-field">

          <label>Driver Name</label>



          <input

            placeholder="Full name"

            value={driverForm.name}

            onChange={(e) =>

              setDriverForm({

                ...driverForm,

                name: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Phone</label>



          <input

            placeholder="Phone number"

            value={driverForm.phone}

            onChange={(e) =>

              setDriverForm({

                ...driverForm,

                phone: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>License Number</label>



          <input

            placeholder="License number"

            value={driverForm.licenseNumber}

            onChange={(e) =>

              setDriverForm({

                ...driverForm,

                licenseNumber: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Status</label>



          <select

            value={driverForm.status}

            onChange={(e) =>

              setDriverForm({

                ...driverForm,

                status: e.target.value,

              })

            }

          >

            <option>Available</option>

            <option>Assigned</option>

            <option>Off Duty</option>

          </select>

        </div>



        <div className="form-action">

          <button type="submit">

            + Add Driver

          </button>

        </div>



      </form>



      <Table>



        <thead>

          <tr>

            <th>ID</th>

            <th>Name</th>

            <th>Phone</th>

            <th>License</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>



        <tbody>



          {drivers.map((driver) => (

            <tr key={driver.id}>



              <td className="id-cell">

                #{driver.id}

              </td>



              <td className="strong-cell">

                {driver.name}

              </td>



              <td>{driver.phone}</td>

              <td>{driver.licenseNumber}</td>



              <td>

                <StatusBadge status={driver.status} />

              </td>



              <td>

                <button

                  className="delete-button"

                  onClick={() =>

                    deleteItem(

                      "drivers",

                      driver.id

                    )

                  }

                >

                  Delete

                </button>

              </td>



            </tr>

          ))}



        </tbody>



      </Table>



    </section>

  );



  // =========================*

  // ROUTES*

  // =========================*



  const renderRoutes = () => (

    <section className="management-section">



      <div className="page-section-header">

        <div>

          <span className="eyebrow">NETWORK</span>

          <h2>Routes</h2>

          <p>Manage transportation routes and estimated travel time.</p>

        </div>



        <div className="record-count">

          {routes.length} Records

        </div>

      </div>



      <form

        className="management-form"

        onSubmit={handleRouteSubmit}

      >



        <div className="form-field">

          <label>Source</label>



          <input

            placeholder="Starting location"

            value={routeForm.source}

            onChange={(e) =>

              setRouteForm({

                ...routeForm,

                source: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Destination</label>



          <input

            placeholder="Destination"

            value={routeForm.destination}

            onChange={(e) =>

              setRouteForm({

                ...routeForm,

                destination: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Distance (km)</label>



          <input

            type="number"

            step="0.1"

            placeholder="Distance"

            value={routeForm.distance}

            onChange={(e) =>

              setRouteForm({

                ...routeForm,

                distance: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Estimated Time</label>



          <input

            placeholder="e.g. 10 hours"

            value={routeForm.estimatedTime}

            onChange={(e) =>

              setRouteForm({

                ...routeForm,

                estimatedTime: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-action">

          <button type="submit">

            + Add Route

          </button>

        </div>



      </form>



      <Table>



        <thead>

          <tr>

            <th>ID</th>

            <th>Source</th>

            <th>Destination</th>

            <th>Distance</th>

            <th>Estimated Time</th>

            <th>Action</th>

          </tr>

        </thead>



        <tbody>



          {routes.map((route) => (

            <tr key={route.id}>



              <td className="id-cell">

                #{route.id}

              </td>



              <td className="strong-cell">

                {route.source}

              </td>



              <td>{route.destination}</td>

              <td>{route.distance} km</td>

              <td>{route.estimatedTime}</td>



              <td>

                <button

                  className="delete-button"

                  onClick={() =>

                    deleteItem(

                      "routes",

                      route.id

                    )

                  }

                >

                  Delete

                </button>

              </td>



            </tr>

          ))}



        </tbody>



      </Table>



    </section>

  );



  // =========================*

  // DELIVERIES*

  // =========================*



  const renderDeliveries = () => (

    <section className="management-section">



      <div className="page-section-header">

        <div>

          <span className="eyebrow">OPERATIONS</span>

          <h2>Deliveries</h2>

          <p>Assign resources and track delivery progress.</p>

        </div>



        <div className="record-count">

          {deliveries.length} Records

        </div>

      </div>



      <form

        className="management-form delivery-form"

        onSubmit={handleDeliverySubmit}

      >



        <div className="form-field">

          <label>Order</label>



          <select

            value={deliveryForm.orderId}

            onChange={(e) =>

              setDeliveryForm({

                ...deliveryForm,

                orderId: e.target.value,

              })

            }

            required

          >

            <option value="">

              Select Order

            </option>



            {orders.map((order) => (

              <option

                key={order.id}

                value={order.id}

              >

                {order.orderNumber}

              </option>

            ))}

          </select>

        </div>



        <div className="form-field">

          <label>Vehicle</label>



          <select

            value={deliveryForm.vehicleId}

            onChange={(e) =>

              setDeliveryForm({

                ...deliveryForm,

                vehicleId: e.target.value,

              })

            }

            required

          >

            <option value="">

              Select Available Vehicle

            </option>



            {availableVehicleList.map((vehicle) => (

              <option

                key={vehicle.id}

                value={vehicle.id}

              >

                {vehicle.vehicleNumber}

              </option>

            ))}

          </select>

        </div>



        <div className="form-field">

          <label>Driver</label>



          <select

            value={deliveryForm.driverId}

            onChange={(e) =>

              setDeliveryForm({

                ...deliveryForm,

                driverId: e.target.value,

              })

            }

            required

          >

            <option value="">

              Select Available Driver

            </option>



            {availableDriverList.map((driver) => (

              <option

                key={driver.id}

                value={driver.id}

              >

                {driver.name}

              </option>

            ))}

          </select>

        </div>



        <div className="form-field">

          <label>Route</label>



          <select

            value={deliveryForm.routeId}

            onChange={(e) =>

              setDeliveryForm({

                ...deliveryForm,

                routeId: e.target.value,

              })

            }

            required

          >

            <option value="">

              Select Route

            </option>



            {routes.map((route) => (

              <option

                key={route.id}

                value={route.id}

              >

                {route.source} → {route.destination}

              </option>

            ))}

          </select>

        </div>



        <div className="form-field">

          <label>Delivery Date</label>



          <input

            type="date"

            value={deliveryForm.deliveryDate}

            onChange={(e) =>

              setDeliveryForm({

                ...deliveryForm,

                deliveryDate: e.target.value,

              })

            }

            required

          />

        </div>



        <div className="form-field">

          <label>Status</label>



          <select

            value={deliveryForm.status}

            onChange={(e) =>

              setDeliveryForm({

                ...deliveryForm,

                status: e.target.value,

              })

            }

          >

            <option>Pending</option>

            <option>In Transit</option>

            <option>Delivered</option>

          </select>

        </div>



        <div className="form-action">

          <button type="submit">

            + Create Delivery

          </button>

        </div>



      </form>



      <Table>



        <thead>

          <tr>

            <th>ID</th>

            <th>Order</th>

            <th>Vehicle</th>

            <th>Driver</th>

            <th>Route</th>

            <th>Date</th>

            <th>Status</th>

            <th>Action</th>

          </tr>

        </thead>



        <tbody>



          {deliveries.map((delivery) => {



            const order = orders.find(

              (o) => o.id === delivery.orderId

            );



            const vehicle = vehicles.find(

              (v) => v.id === delivery.vehicleId

            );



            const driver = drivers.find(

              (d) => d.id === delivery.driverId

            );



            const route = routes.find(

              (r) => r.id === delivery.routeId

            );



            return (

              <tr key={delivery.id}>



                <td className="id-cell">

                  #{delivery.id}

                </td>



                <td className="strong-cell">

                  {order?.orderNumber || delivery.orderId}

                </td>



                <td>

                  {vehicle?.vehicleNumber || delivery.vehicleId}

                </td>



                <td>

                  {driver?.name || delivery.driverId}

                </td>



                <td>

                  {route

                    ? `${route.source} → ${route.destination}`

                    : delivery.routeId}

                </td>



                <td>

                  {delivery.deliveryDate}

                </td>



                <td>



                  <select

                    className="status-select"

                    value={delivery.status}

                    onChange={(e) =>

                      updateDeliveryStatus(

                        delivery,

                        e.target.value

                      )

                    }

                  >

                    <option>Pending</option>

                    <option>In Transit</option>

                    <option>Delivered</option>

                  </select>



                </td>



                <td>



                  <button

                    className="delete-button"

                    onClick={() =>

                      deleteItem(

                        "deliveries",

                        delivery.id

                      )

                    }

                  >

                    Delete

                  </button>



                </td>



              </tr>

            );

          })}



        </tbody>



      </Table>



    </section>

  );



  // =========================*

  // TABLE*

  // =========================*



  const Table = ({ children }) => (

    <div className="table-container">

      <table>{children}</table>

    </div>

  );



  // =========================*

  // APP*

  // =========================*




  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (

    <div className="app">



      <aside className="sidebar">



        <div className="brand">



          <div className="brand-mark">

            SL

          </div>



          <div>

            <h1>SmartLogix</h1>

            <span>Management System</span>

          </div>



        </div>



        <div className="nav-label">

          MAIN MENU

        </div>



        <nav className="sidebar-nav">



          {navigation.map((item) => (

            <button

              key={item.id}

              className={

                activePage === item.id

                  ? "nav-item active"

                  : "nav-item"

              }

              onClick={() =>

                setActivePage(item.id)

              }

            >



              <span className="nav-icon">

                {item.icon}

              </span>



              <span>

                {item.label}

              </span>



            </button>

          ))}



        </nav>



        <div className="sidebar-footer">



          <div className="system-status">

            <span className="online-dot"></span>



            <div>

              <strong>System Online</strong>

              <small>All services operational</small>

            </div>

          </div>



          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>



        </div>



      </aside>



      <main className="main-area">



        <header className="topbar">



          <div>

            <h2>

              {pageInfo[activePage].title}

            </h2>



            <p>

              {pageInfo[activePage].subtitle}

            </p>

          </div>



          <div className="topbar-right">



            <div className="live-indicator">

              <span></span>

              Live

            </div>



            <div className="profile">



              <div className="profile-avatar">

                A

              </div>



              <div>

                <strong>Administrator</strong>

                <span>Logistics Admin</span>

              </div>



            </div>



          </div>



        </header>



        <div className="main-content">



          {activePage === "dashboard" &&

            renderDashboard()}



          {activePage === "orders" &&

            renderOrders()}



          {activePage === "warehouses" &&

            renderWarehouses()}



          {activePage === "vehicles" &&

            renderVehicles()}



          {activePage === "drivers" &&

            renderDrivers()}



          {activePage === "routes" &&

            renderRoutes()}



          {activePage === "deliveries" &&

            renderDeliveries()}



        </div>



      </main>



    </div>

  );

}



function LoginPage({ onLogin }) {

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("smartlogix_users") || "[]");
    } catch {
      return [];
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const users = getUsers();

    if (mode === "login") {
      const user = users.find(
        (item) =>
          item.email.toLowerCase() === email.trim().toLowerCase() &&
          item.password === password
      );

      if (!user) {
        setError("Invalid email or password.");
        return;
      }

      localStorage.setItem("smartlogix_authenticated", "true");
      onLogin();
      return;
    }

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (
      users.some(
        (item) =>
          item.email.toLowerCase() === email.trim().toLowerCase()
      )
    ) {
      setError("An account with this email already exists.");
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password,
    };

    localStorage.setItem(
      "smartlogix_users",
      JSON.stringify([...users, newUser])
    );

    localStorage.setItem("smartlogix_authenticated", "true");
    onLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-brand-mark">SL</div>

          <div>
            <h1>SmartLogix</h1>
            <span>Management System</span>
          </div>
        </div>

        <div className="auth-heading">
          <h2>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>

          <p>
            {mode === "login"
              ? "Sign in to manage your logistics operations."
              : "Create your SmartLogix account to continue."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          {mode === "signup" && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {mode === "signup" && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          SmartLogix • Logistics Management System
        </div>

      </div>
    </div>
  );
}

export default App;