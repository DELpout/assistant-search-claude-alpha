import React, { useState, useEffect } from 'react';
import { Save, FileDown, Trash2, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Papa from 'papaparse';

const ResearchTracker = () => {
  const [researchEntries, setResearchEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [newEntry, setNewEntry] = useState({
    title: '',
    url: '',
    date: '',
    description: '',
    evidenceLevel: '',
    category: '',
    notes: '',
    tags: []
  });

  const categories = [
    'Biomécanique',
    'Ostéopathie',
    'Neurosciences',
    'Anatomie',
    'Neuroanatomie',
    'Neurophysiologie',
    'Biomécanique clinique'
  ];

  const evidenceLevels = [
    'Niveau 1 - Méta-analyses',
    'Niveau 2 - Études prospectives',
    'Niveau 3 - Études rétrospectives',
    'Niveau 4 - Consensus d\'experts'
  ];

  useEffect(() => {
    const savedEntries = localStorage.getItem('researchEntries');
    if (savedEntries) {
      setResearchEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('researchEntries', JSON.stringify(researchEntries));
  }, [researchEntries]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev.tags, e.target.value]
      }));
      e.target.value = '';
    }
  };

  const removeTag = (indexToRemove) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  const addEntry = () => {
    if (newEntry.title && newEntry.url) {
      const entryWithDate = {
        ...newEntry,
        date: new Date().toISOString().split('T')[0],
        id: Date.now().toString()
      };
      setResearchEntries(prev => [...prev, entryWithDate]);
      setNewEntry({
        title: '',
        url: '',
        date: '',
        description: '',
        evidenceLevel: '',
        category: '',
        notes: '',
        tags: []
      });
    }
  };

  const deleteEntry = (id) => {
    setResearchEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(researchEntries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'recherches_biomedicales.csv';
    link.click();
  };

  const exportToDocx = () => {
    let docContent = 'JOURNAL DE RECHERCHE BIOMÉDICALE\n\n';
    researchEntries.forEach((entry, index) => {
      docContent += `${index + 1}. ${entry.title.toUpperCase()}\n`;
      docContent += `URL: ${entry.url}\n`;
      docContent += `Date: ${entry.date}\n`;
      docContent += `Catégorie: ${entry.category}\n`;
      docContent += `Niveau de preuve: ${entry.evidenceLevel}\n`;
      docContent += `Description: ${entry.description}\n`;
      docContent += `Notes: ${entry.notes}\n`;
      docContent += `Tags: ${entry.tags.join(', ')}\n\n`;
    });

    const blob = new Blob([docContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'recherches_biomedicales.docx';
    link.click();
  };

  const filteredEntries = researchEntries
    .filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !filterCategory || entry.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assistant Search Claude Alpha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full p-2 border rounded"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">Toutes catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Input Form */}
            <input
              type="text"
              name="title"
              value={newEntry.title}
              onChange={handleInputChange}
              placeholder="Titre de la recherche"
              className="w-full p-2 border rounded"
            />
            <input
              type="url"
              name="url"
              value={newEntry.url}
              onChange={handleInputChange}
              placeholder="URL de la source"
              className="w-full p-2 border rounded"
            />
            <select
              name="category"
              value={newEntry.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              name="evidenceLevel"
              value={newEntry.evidenceLevel}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Niveau de preuve</option>
              {evidenceLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <textarea
              name="description"
              value={newEntry.description}
              onChange={handleInputChange}
              placeholder="Description de la recherche"
              className="w-full p-2 border rounded"
              rows="3"
            />
            <textarea
              name="notes"
              value={newEntry.notes}
              onChange={handleInputChange}
              placeholder="Notes additionnelles"
              className="w-full p-2 border rounded"
              rows="2"
            />
            {/* Tags Input */}
            <div>
              <input
                type="text"
                placeholder="Ajouter des tags (Entrée pour valider)"
                onKeyPress={handleTagInput}
                className="w-full p-2 border rounded"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {newEntry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={addEntry}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Plus size={16} />
              Ajouter l'entrée
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <FileDown size={16} />
          Exporter CSV
        </button>
        <button
          onClick={exportToDocx}
          className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          <Save size={16} />
          Exporter DOCX
        </button>
      </div>

      {/* Research Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{entry.title}</h3>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {entry.url}
                </a>
                <p className="text-sm text-gray-500">Date: {entry.date}</p>
                <p className="text-sm text-gray-500">Catégorie: {entry.category}</p>
                <p className="text-sm text-gray-500">
                  Niveau de preuve: {entry.evidenceLevel}
                </p>
                <p className="mt-2">{entry.description}</p>
                {entry.notes && (
                  <p className="mt-2 text-sm italic">{entry.notes}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {entry.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResearchTracker;