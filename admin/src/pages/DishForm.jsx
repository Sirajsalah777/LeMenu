import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function DishForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    name_en: '',
    category: 'Entrées',
    price: '',
    description: '',
    description_ar: '',
    description_en: '',
    weight_grams: '',
    calories: '',
    is_available: true,
    allergens: [],
    photos: [],
    video_url: '',
    model_url: ''
  });

  const categories = ['Entrées', 'Plats', 'Desserts', 'Boissons', 'Spécialités'];
  const allergenOptions = ['Gluten', 'Lactose', 'Fruits à coque', 'Oeufs', 'Poisson', 'Soja', 'Sésame', 'Arachides'];

  const uploadFile = async (file, endpoint) => {
    const data = new FormData();
    data.append('file', file);
    const res = await axios.post(`http://localhost:8000/api/media/upload/${endpoint}`, data);
    return res.data.url;
  };

  const { getRootProps: photoProps, getInputProps: photoInput } = useDropzone({
    accept: {'image/*': []},
    onDrop: async files => {
      const urls = await Promise.all(files.map(f => uploadFile(f, 'photo')));
      setFormData(prev => ({...prev, photos: [...prev.photos, ...urls]}));
    }
  });

  const { getRootProps: videoProps, getInputProps: videoInput } = useDropzone({
    accept: {'video/*': []},
    maxFiles: 1,
    onDrop: async files => {
      const url = await uploadFile(files[0], 'video');
      setFormData(prev => ({...prev, video_url: url}));
    }
  });

  const { getRootProps: modelProps, getInputProps: modelInput } = useDropzone({
    accept: {'model/gltf-binary': ['.glb'], 'model/gltf+json': ['.gltf']},
    maxFiles: 1,
    onDrop: async files => {
      const url = await uploadFile(files[0], 'model');
      setFormData(prev => ({...prev, model_url: url}));
    }
  });

  const handleAllergen = (e) => {
    const val = e.target.value;
    if (e.target.checked) setFormData(prev => ({...prev, allergens: [...prev.allergens, val]}));
    else setFormData(prev => ({...prev, allergens: prev.allergens.filter(a => a !== val)}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('name_ar', formData.name_ar);
    form.append('name_en', formData.name_en);
    form.append('category', formData.category);
    form.append('price', parseFloat(formData.price));
    form.append('description', formData.description);
    form.append('description_ar', formData.description_ar);
    form.append('description_en', formData.description_en);
    form.append('weight_grams', formData.weight_grams);
    form.append('calories', formData.calories);
    form.append('allergens', JSON.stringify(formData.allergens));
    form.append('photos', JSON.stringify(formData.photos));
    if (formData.video_url) form.append('video_url', formData.video_url);
    if (formData.model_url) form.append('model_url', formData.model_url);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/dishes/', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Plat sauvegardé avec succès');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="layout">
      <main className="content">
        <h2>Ajouter / Modifier un Plat</h2>
        <form onSubmit={handleSubmit} className="dish-form">
          <div className="form-group">
            <label>Nom du plat (FR)</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Nom du plat (AR)</label>
              <input type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} dir="rtl" />
            </div>
            <div className="form-group flex-1">
              <label>Nom du plat (EN)</label>
              <input type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Catégorie</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Prix (Dh)</label>
              <input type="number" step="0.1" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description (FR)</label>
            <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Description (AR)</label>
              <textarea rows="2" value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} dir="rtl"></textarea>
            </div>
            <div className="form-group flex-1">
              <label>Description (EN)</label>
              <textarea rows="2" value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})}></textarea>
            </div>
          </div>
          
          <div className="form-row">
             <div className="form-group flex-1">
                <label>Poids (grammes)</label>
                <input type="number" value={formData.weight_grams} onChange={e => setFormData({...formData, weight_grams: e.target.value})} />
             </div>
             <div className="form-group flex-1">
                <label>Calories (kcal)</label>
                <input type="number" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} />
             </div>
          </div>

          <div className="form-group">
            <label>Allergènes</label>
            <div className="checkbox-grid">
              {allergenOptions.map(a => (
                <label key={a} className="checkbox-label">
                  <input type="checkbox" value={a} checked={formData.allergens.includes(a)} onChange={handleAllergen} /> {a}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Photos ({formData.photos.length} chargées)</label>
            <div {...photoProps()} className="dropzone">
              <input {...photoInput()} />
              <p>Glissez vos photos ici</p>
            </div>
          </div>
          <div className="form-group">
            <label>Vidéo {formData.video_url && '(Chargée ✔)'}</label>
            <div {...videoProps()} className="dropzone">
              <input {...videoInput()} />
              <p>Glissez votre vidéo ici</p>
            </div>
          </div>
          <div className="form-group">
            <label>Modèle 3D (.glb, .gltf) {formData.model_url && '(Chargé ✔)'}</label>
            <div {...modelProps()} className="dropzone">
              <input {...modelInput()} />
              <p>Glissez votre modèle 3D ici</p>
            </div>
          </div>

          <div className="actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </main>
    </div>
  );
}
