class DataManager {
  constructor(file) {
    this.file = new Uint8Array(file);
    this.resetfile = new Uint8Array(file.slice(0));
  }

  writevalues(address, values) {
    console.log(`Length of file: ${this.file.length}`);
    console.log(`Writing ${values.length} values to address ${address}`);
    this.file.set(values, address);
  }

  reset() {
    this.file.set(this.resetfile);
  }
}

function randoshop(data) {
  return fetch('randoshop.json')
    .then(response => response.json())
    .then(changes => {
      for (const [address, values] of changes) {    
        data.writevalues(address, new Uint8Array(values));
      }
    })
    .catch(error => {
      console.error('Error applying changes:', error);
    });
}


const checkboxes = [
  { label: 'randoshop', func: randoshop },
];

const downloadButton = document.getElementById('download-button');
const fileInput = document.getElementById('file-upload');
const checkboxContainer = document.getElementById('checkbox-container');
const numPerColumn = Math.ceil(checkboxes.length / 2);

checkboxes.forEach((option, index) => {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `checkbox-${index}`;

  const label = document.createElement('label');
  label.for = `checkbox-${index}`;
  label.textContent = option.label;

  const column = index < numPerColumn ? checkboxContainer.children[0] : checkboxContainer.children[1];
  column.appendChild(checkbox);
  column.appendChild(label);
});

let data = null;


function downloadFile() {
  const file = fileInput.files[0];
  const url = URL.createObjectURL(file);

  fetch(url)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const data = new DataManager(buffer);
      console.log(data.file == data.resetfile);

      const promises = checkboxes.map((option, index) => {
        const checkbox = document.getElementById(`checkbox-${index}`);

        console.log(`checkbox ${index} checked: ${checkbox.checked}`);

        if (checkbox.checked) {
          return option.func(data);
        }
      }).filter(promise => promise); // remove any undefined promises

      Promise.all(promises).then(() => {
        console.log(data.file == data.resetfile);

        const modifiedBlob = new Blob([data.file], { type: file.type });
        const modifiedUrl = URL.createObjectURL(modifiedBlob);
        downloadLink(modifiedUrl);
      }).catch(error => {
        console.error('Error applying changes:', error);
      });
    })
    .catch(error => {
      console.error('Error fetching or modifying file:', error);
    });
}




function downloadLink(url) {
  const link = document.createElement('a');
  link.href = url;
  link.download = 'modified-file.bin';
  link.click();
}
