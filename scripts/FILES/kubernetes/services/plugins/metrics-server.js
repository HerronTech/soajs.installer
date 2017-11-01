'use strict';

var components = {
	
	customNamespace: true,
	
	serviceAccount: {
		"apiVersion": "v1",
		"kind": "ServiceAccount",
		"metadata": {
			"name": "metrics-server",
			"namespace": "kube-system"
		}
	},
	
	service: {
		"apiVersion": "v1",
		"kind": "Service",
		"metadata": {
			"name": "metrics-server",
			"namespace": "kube-system",
			"labels": {
				"kubernetes.io/name": "Metrics-server"
			}
		},
		"spec": {
			"selector": {
				"k8s-app": "metrics-server"
			},
			"ports": [
				{
					"port": 443,
					"protocol": "TCP",
					"targetPort": 443
				}
			]
		}
	},
	
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "Deployment",
		"metadata": {
			"name": "metrics-server",
			"namespace": "kube-system",
			"labels": {
				"k8s-app": "metrics-server"
			}
		},
		"spec": {
			"selector": {
				"matchLabels": {
					"k8s-app": "metrics-server"
				}
			},
			"template": {
				"metadata": {
					"name": "metrics-server",
					"labels": {
						"k8s-app": "metrics-server"
					}
				},
				"spec": {
					"serviceAccountName": "metrics-server",
					"containers": [
						{
							"name": "metrics-server",
							"image": "gcr.io/google_containers/metrics-server-amd64:dev",
							"imagePullPolicy": "Always",
							"command": [
								"/metrics-server",
								"--source=kubernetes.summary_api:''"
							]
						}
					]
				}
			}
		}
	},
	
	apiService: {
		"apiVersion": "apiregistration.k8s.io/v1beta1",
		"kind": "APIService",
		"metadata": {
			"name": "v1alpha1.metrics",
		},
		"spec": {
			"service": {
				"name": "metrics-server",
				"namespace": "kube-system"
			},
			"group": "metrics",
			"version": "v1alpha1",
			"insecureSkipTLSVerify": true,
			"groupPriorityMinimum": 100,
			"versionPriority": 100
		}
	},
	
	roleBinding: {
		"apiVersion": "rbac.authorization.k8s.io/v1beta1",
		"kind": "RoleBinding",
		"metadata": {
			"name": "metrics-server-auth-reader",
			"namespace": "kube-system"
		},
		"roleRef": {
			"apiGroup": "rbac.authorization.k8s.io",
			"kind": "Role",
			"name": "extension-apiserver-authentication-reader"
		},
		"subjects": [
			{
				"kind": "ServiceAccount",
				"name": "metrics-server",
				"namespace": "kube-system"
			}
		]
	},
	
	clusterRoleBinding: {
		"apiVersion": "rbac.authorization.k8s.io/v1beta1",
		"kind": "ClusterRoleBinding",
		"metadata": {
			"name": "metrics-server:system:auth-delegator",
		},
		"roleRef": {
			"apiGroup": "rbac.authorization.k8s.io",
			"kind": "ClusterRole",
			"name": "system:auth-delegator"
		},
		"subjects": [
			{
				"kind": "ServiceAccount",
				"name": "metrics-server",
				"namespace": "kube-system"
			}
		]
	}
	
};

module.exports = components;
