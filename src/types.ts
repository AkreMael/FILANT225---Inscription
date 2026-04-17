export type ProfileType = 'client' | 'travailleur' | 'proprietaire' | 'agence' | 'entreprise';

export interface Mission {
  id: number;
  title: string;
  date: string;
  status: 'terminée' | 'en cours' | 'annulée';
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'alert' | 'success';
}

export interface UserData {
  profileType: ProfileType;
  details: Record<string, string>;
  isActivated: boolean;
  missions: Mission[];
}

export const PROFILE_LABELS: Record<ProfileType, string> = {
  client: 'Client',
  travailleur: 'Travailleur',
  proprietaire: 'Propriétaire d’équipement',
  agence: 'Agence immobilière',
  entreprise: 'Entreprise',
};

export const PROFILE_FIELDS: Record<ProfileType, string[]> = {
  client: ['Nom', 'Ville', 'Téléphone'],
  travailleur: ['Métier', 'Nom utilisateur', 'Ville actuelle', 'Numéro de téléphone'],
  proprietaire: ['Type d’équipement', 'Nom de l’entreprise', 'Ville', 'Téléphone'],
  agence: ['Nom de l’agence', 'Responsable', 'Ville', 'Téléphone'],
  entreprise: ['Nom de l’entreprise', 'Secteur d’activité', 'Ville', 'Téléphone'],
};
