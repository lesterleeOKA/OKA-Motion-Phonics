
import View from './view';

export default {
  
  percentValue: 0,
  timer: null,

  loadingStart(retry=0) {
    console.log('in loadingStart(), retry:' + retry);
    if (retry>25) return;

    let greenBar = document.getElementById("greenBar");
    if (View.loadingBarWrapper && greenBar) {
      View.loadingBarWrapper.style.display = "flex";
      this.timer = setInterval(()=>{
        let greenBar = document.getElementById("greenBar");
        if (greenBar) {
          if (this.percentValue>=95 && this.timer) clearInterval(this.timer);
          if (!this.percentValue) this.percentValue = 50;
          greenBar.style.width = this.percentValue + "%";
          this.percentValue += ((95 - this.percentValue) / 3);
        } else {
          if (this.timer) clearInterval(this.timer);
        }
      }, 1000);
    } else {
      setTimeout(()=>this.loadingStart(retry+1), 200);
    }
      
  },
  
  loadingComplete() {
    return new Promise((resolve, reject)=>{
      this.percentValue = 100;
      if (this.timer) clearInterval(this.timer);

      let greenBar = document.getElementById("greenBar");
      if (greenBar) {
        greenBar.style.width = this.percentValue + "%";
        setTimeout(()=>{
          if (View.loadingBarWrapper) View.loadingBarWrapper.style.display = "none";
          resolve();
        }, 1000);
      } else {
        resolve();
      }
    });
  }

}
