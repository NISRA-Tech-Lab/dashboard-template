export function insertExpandButtons () {

    const canvases = document.getElementsByClassName("chart-canvas");
    
    for (let i = 0; i < canvases.length; i ++) {

        const canvas = canvases[i];

        const button = document.createElement("button");
        button.className = "btn btn-sm btn-outline-secondary rounded-circle d-none d-xl-flex ms-auto justify-content-between align-items-center";
        button.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
        button.setAttribute("data-bs-toggle", "modal");
        button.setAttribute("data-bs-target", `#${canvas.id}-modal`);
        button.setAttribute("title", "Expand chart");
        button.setAttribute("data-bs-placement", "left");
        button.style.marginTop = "-50px";
        button.style.marginBottom = "20px";
        button.style.marginLeft = "80px";
        new bootstrap.Tooltip(button);
        canvas.parentElement.parentElement.parentElement.parentElement.querySelector(".card-footer").appendChild(button);

        const chart_title = canvas.parentElement.parentElement.parentElement.querySelector(".card-header").innerHTML;

        const modal = document.createElement("div");
        modal.classList.add("modal", "fade");
        modal.id = `${canvas.id}-modal`;
        modal.tabIndex = -1;
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = `
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <p class="h5 modal-title">${chart_title}</p>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <canvas id="${canvas.id}-expanded"></canvas>
                </div>
            </div>
        </div>
        `
        canvas.parentNode.appendChild(modal);
    }

}