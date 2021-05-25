let store = Immutable.Map({
  rovers: Immutable.List(["Curiosity", "Opportunity", "Spirit"]),
  roverInfo: Immutable.Map({}),
  roverPhotos: Immutable.List([]),
  loading: false,
});

const ImageCarousel = (imageUrls) => {
  const Item = (url, active) => {
    return `
                <div class="carousel-item ${active ? "active" : ""}" >
                    <img src="${url}"  
                         class="d-block w-100"
                         alt="..."
                    />
                </div>
            
        `;
  };

  return `
      <div
        id="carouselBasicExample"
        class="carousel slide carousel-fade"
        data-mdb-ride="carousel"
      >
        <!-- Inner -->
        <div class="carousel-inner">
          <!-- Single item -->
          ${imageUrls.map((url, idx) => Item(url, idx === 0)).join("\n")}
        </div>
        <!-- Inner -->
        <!-- Controls -->
        <button class="carousel-control-prev"
                type="button"
                data-mdb-target="#carouselBasicExample"
                data-mdb-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next"
                type="button"
                data-mdb-target="#carouselBasicExample"
                data-mdb-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    `;
};

const RoverInfoTable = (data) => {
  const Row = (key, value) => {
    return `<tr>
                <th scope="row">${key}</th>
                <td>${value}</td>
            </tr>`;
  };

  return `
            <table class="table table-sm">
                <thead class="table-dark"><th colspan="2">Rover Info</th></thead>
                <tbody>
                    ${Object.keys(data)
                      .map((k) => Row(k, data[k]))
                      .join("\n")}
                </tbody>
            </table>
    `;
};

const Spinner = () => {
  return `
        <div class="row">
            <div class="col-md">
                <div class="d-flex justify-content-center">
                    <div class="spinner-border m-5" style="width: 3rem; height: 3rem;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const NavBar = (roverNames, onClickHandlerName) => {
  const NavBarItem = (name) => {
    return `
            <li class="nav-item" onclick="${onClickHandlerName}('${name}')">
                <a class="nav-link">${name}</a>
            </li>
        `;
  };

  const html = `
        <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
            <a class="navbar-brand" href="#">Mars Dashboard</a>
                <button class="navbar-toggler"
                        type="button"
                        data-mdb-toggle="collapse"
                        data-mdb-target="#navbarNavAltMarkup"
                        aria-controls="navbarNavAltMarkup"
                        aria-expanded="false"
                        aria-label="Toggle navigation">
                <i class="fas fa-bars"></i>
                </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    ${roverNames.map(NavBarItem).join("\n")}
                </ul>
            </div>
        </div>
        </nav>
    `;

  return html;
};

const RoverInfoPage = (roverInfo, roverPhotos) => {
  return `
        <div class="row">
            <div class="col-md">
                ${RoverInfoTable(roverInfo)}
            </div>
        </div>
        <div class="row">
            <div class="col-md">
                ${ImageCarousel(roverPhotos)}
            </div>
        </div>
    `;
};

const root = document.getElementById("root");

const updateStore = (currentStore, newState) => {
  store = currentStore.mergeDeep(Immutable.fromJS(newState));
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  return `
        <header></header>
        <main>
            ${NavBar(state.get("rovers"), "getRoverDetails")}
            <div class="container">
                ${
                  state.get("loading")
                    ? Spinner()
                    : RoverInfoPage(
                        state.get("roverInfo").toJS(),
                        state.get("roverPhotos").toJS()
                      )
                }
            </div>
        </main>
        <footer></footer>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  render(root, store);
  getRoverDetails(store.get("rovers").get(0));
});

const getRoverDetails = (name) => {
  updateStore(store, { loading: true });
  fetch(`http://localhost:3000/roverInfo/${name}`)
    .then((res) => res.json())
    .then((roverData) => {
      updateStore(store, roverData);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      updateStore(store, { loading: false });
    });
};
